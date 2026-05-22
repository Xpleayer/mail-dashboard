import { NextResponse } from "next/server";
import { n8nFetch } from "@/lib/n8n";

const WORKFLOW_NAME = "[Mailboard] Billing Reminders";

function buildWorkflow(templateId: number, hour: number, active: boolean) {
  return {
    name: WORKFLOW_NAME,
    active,
    nodes: [
      {
        id: "a1b2c3d4-0001-0001-0001-000000000001",
        name: "Schedule",
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          rule: {
            interval: [
              { field: "cronExpression", expression: `0 ${hour} * * *` },
            ],
          },
        },
      },
      {
        id: "a1b2c3d4-0001-0001-0001-000000000002",
        name: "Get Due Clients",
        type: "n8n-nodes-base.postgres",
        typeVersion: 1,
        position: [470, 300],
        parameters: {
          operation: "executeQuery",
          query: `SELECT c.*, t.subject, t.body FROM clients c, templates t WHERE EXTRACT(DAY FROM NOW()) = c.billing_day AND t.id = ${templateId}`,
        },
      },
      {
        id: "a1b2c3d4-0001-0001-0001-000000000003",
        name: "Send Reminders",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 3,
        position: [690, 300],
        parameters: {
          method: "POST",
          url: `${process.env.NEXTAUTH_URL}/api/email/send`,
          sendBody: true,
          contentType: "json",
          bodyParameters: {
            parameters: [
              { name: "to", value: "={{ $json.email }}" },
              { name: "subject", value: "={{ $json.subject }}" },
              { name: "body", value: "={{ $json.body }}" },
            ],
          },
        },
      },
    ],
    connections: {
      Schedule: {
        main: [[{ node: "Get Due Clients", type: "main", index: 0 }]],
      },
      "Get Due Clients": {
        main: [[{ node: "Send Reminders", type: "main", index: 0 }]],
      },
    },
    settings: { executionOrder: "v1" },
  };
}

export async function POST(req: Request) {
  const { templateId, time, active } = await req.json();
  const hour = parseInt((time as string).split(":")[0], 10);
  const workflow = buildWorkflow(templateId, hour, active);

  // Find existing [Mailboard] Billing Reminders workflow
  const listRes = await n8nFetch("/workflows");
  if (!listRes.ok)
    return NextResponse.json({ error: "Failed to reach n8n" }, { status: 502 });

  const listData = await listRes.json();
  const existing = (listData.data ?? []).find(
    (w: { name: string }) => w.name === WORKFLOW_NAME
  );

  let res: Response;
  if (existing) {
    res = await n8nFetch(`/workflows/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify(workflow),
    });
  } else {
    res = await n8nFetch("/workflows", {
      method: "POST",
      body: JSON.stringify(workflow),
    });
  }

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  return NextResponse.json(await res.json());
}
