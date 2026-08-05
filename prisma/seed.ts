import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/passwords";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.securityAlert.deleteMany();
  await prisma.aiUsageEvent.deleteMany();
  await prisma.costRecord.deleteMany();
  await prisma.aiAgent.deleteMany();
  await prisma.aiTool.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  const tenant = await prisma.tenant.create({
    data: {
      name: "SprintPark Industries",
      slug: "sprintpark"
    }
  });

  const passwordHash = hashPassword("SprintPark!2026");

  await prisma.user.createMany({
    data: [
      { tenantId: tenant.id, email: "executive@saicc.local", name: "Avery Chen", role: "EXECUTIVE", department: "Executive Office", passwordHash },
      { tenantId: tenant.id, email: "security@saicc.local", name: "Maya Iyer", role: "SECURITY", department: "Security", passwordHash },
      { tenantId: tenant.id, email: "admin@saicc.local", name: "Jordan Patel", role: "PLATFORM_ADMIN", department: "AI Platform", passwordHash },
      { tenantId: tenant.id, email: "finance@saicc.local", name: "Elena Brooks", role: "FINANCE", department: "Finance", passwordHash },
      { tenantId: tenant.id, email: "department@saicc.local", name: "Sam Rivera", role: "DEPARTMENT_HEAD", department: "Engineering", passwordHash }
    ]
  });

  const tools = await Promise.all([
    prisma.aiTool.create({ data: { tenantId: tenant.id, name: "ChatGPT Enterprise", provider: "OpenAI", category: "Assistant", status: "APPROVED", ownerTeam: "AI Platform", monthlyCost: 18400, riskNotes: "Approved workspace, prompt retention disabled." } }),
    prisma.aiTool.create({ data: { tenantId: tenant.id, name: "Microsoft Copilot", provider: "Microsoft", category: "Productivity", status: "APPROVED", ownerTeam: "Digital Workplace", monthlyCost: 22100, riskNotes: "Tenant controls enabled." } }),
    prisma.aiTool.create({ data: { tenantId: tenant.id, name: "Unmanaged Browser AI", provider: "Unknown", category: "Shadow AI", status: "UNDER_REVIEW", ownerTeam: "Security", monthlyCost: 1400, riskNotes: "Detected by synthetic proxy metadata." } }),
    prisma.aiTool.create({ data: { tenantId: tenant.id, name: "Experimental Code Agent", provider: "Internal", category: "Agent", status: "BLOCKED", ownerTeam: "Engineering", monthlyCost: 900, riskNotes: "Blocked pending audit trail controls." } })
  ]);

  const events = [
    ["OpenAI", "Engineering", "code_assistance", "LOW", false, 6800, 9.2],
    ["Microsoft", "Finance", "spreadsheet_analysis", "MEDIUM", false, 4200, 5.4],
    ["Unknown", "Sales", "customer_data", "HIGH", true, 3200, 3.8],
    ["OpenAI", "Legal", "contract_review", "CRITICAL", true, 9100, 13.7],
    ["OpenAI", "Marketing", "campaign_copy", "LOW", false, 2100, 2.2],
    ["Microsoft", "Engineering", "meeting_summary", "LOW", false, 1400, 1.6],
    ["Unknown", "Finance", "invoice_upload", "HIGH", true, 2800, 3.1]
  ] as const;

  for (let index = 0; index < events.length; index += 1) {
    const [provider, department, category, riskLevel, sensitive, tokens, cost] = events[index];
    const tool = tools.find((item) => item.provider === provider) ?? tools[2];
    await prisma.aiUsageEvent.create({
      data: {
        tenantId: tenant.id,
        toolId: tool.id,
        userEmail: `${department.toLowerCase()}.user@sprintpark.example`,
        department,
        provider,
        eventType: index % 2 === 0 ? "prompt_completion" : "file_analysis",
        promptCategory: category,
        riskLevel,
        tokens,
        estimatedCost: cost,
        containsSensitive: sensitive,
        occurredAt: new Date(Date.now() - index * 1000 * 60 * 37)
      }
    });
  }

  await prisma.securityAlert.createMany({
    data: [
      { tenantId: tenant.id, title: "Potential customer PII submitted to under-review tool", description: "Synthetic event detected sensitive customer metadata flowing through unmanaged browser AI.", source: "Synthetic Ingestion", riskLevel: "HIGH" },
      { tenantId: tenant.id, title: "Critical legal document classification event", description: "Contract review prompt categorized as privileged legal data. Full prompt body was not stored.", source: "Prompt Risk Classifier", riskLevel: "CRITICAL" },
      { tenantId: tenant.id, title: "Blocked agent attempted scheduled run", description: "Experimental Code Agent attempted to run after governance status changed to blocked.", source: "Agent Monitor", riskLevel: "MEDIUM" }
    ]
  });

  await prisma.aiAgent.createMany({
    data: [
      { tenantId: tenant.id, name: "Invoice Review Agent", ownerTeam: "Finance Automation", status: "HEALTHY", lastRunAt: new Date(Date.now() - 1000 * 60 * 12), successRate: 98.4, latencyMs: 860 },
      { tenantId: tenant.id, name: "Support Triage Agent", ownerTeam: "Customer Operations", status: "DEGRADED", lastRunAt: new Date(Date.now() - 1000 * 60 * 42), successRate: 87.2, latencyMs: 2140 },
      { tenantId: tenant.id, name: "Code Review Agent", ownerTeam: "Engineering", status: "DOWN", lastRunAt: new Date(Date.now() - 1000 * 60 * 180), successRate: 71.5, latencyMs: 3910 }
    ]
  });

  await prisma.costRecord.createMany({
    data: [
      { tenantId: tenant.id, provider: "OpenAI", department: "Engineering", month: "2026-08", spend: 11200, licenses: 240, inactive: 17 },
      { tenantId: tenant.id, provider: "OpenAI", department: "Legal", month: "2026-08", spend: 5100, licenses: 48, inactive: 4 },
      { tenantId: tenant.id, provider: "Microsoft", department: "Finance", month: "2026-08", spend: 7600, licenses: 190, inactive: 32 },
      { tenantId: tenant.id, provider: "Microsoft", department: "Sales", month: "2026-08", spend: 9300, licenses: 260, inactive: 51 },
      { tenantId: tenant.id, provider: "Unknown", department: "Sales", month: "2026-08", spend: 1400, licenses: 0, inactive: 0 }
    ]
  });

  const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@saicc.local" } });
  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      actorId: admin.id,
      action: "seeded_milestone_1_data",
      entity: "Tenant",
      entityId: tenant.id,
      metadata: { milestone: "SAICC Milestone 1" }
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
