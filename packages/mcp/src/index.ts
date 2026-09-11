
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { auditCode, auditFile, allRules } from "@microspark/linter";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const DESIGN_MD_PATH = path.resolve(__dirname, "../DESIGN.md");

const server = new Server(
  {
    name: "microspark-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "microspark://manifesto/aesthetic",
        name: "Microspark Aesthetic Manifesto (Anti-AI)",
        description:
          "Princípios de design e diretrizes arquiteturais para interfaces autênticas, eliminando clichês visuais de IA.",
        mimeType: "text/markdown",
      },
      {
        uri: "microspark://rules/all",
        name: "Microspark Linter Rules Catalog",
        description:
          "Catálogo com todas as regras e clichês verificados pela engine estática do Microspark.",
        mimeType: "text/markdown",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === "microspark://manifesto/aesthetic") {
    try {
      const content = await fs.readFile(DESIGN_MD_PATH, "utf-8");
      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: content,
          },
        ],
      };
    } catch {
  
      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: `# Microspark Aesthetic Manifesto // Anti-AI Design System\n\n- Rejeite simetrias preguiçosas (3 cards idênticos).\n- Use tipografia monumental no H1 (text-6xl+).\n- Elimine 'blur-3xl' artificiais e gradientes roxos genéricos.\n- Prefira iluminação física e shaders WebGL.`,
          },
        ],
      };
    }
  }

  if (uri === "microspark://rules/all") {
    const rulesMarkdown = allRules
      .map((rule) => {
        return `### \`${rule.id}\` [${rule.severity.toUpperCase()}]
- **Descrição:** ${rule.description}
`;
      })
      .join("\n");

    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: `# Catálogo de Regras do Microspark Linter\n\n${rulesMarkdown}`,
        },
      ],
    };
  }

  throw new Error(`Resource não encontrado para a URI: ${uri}`);
});


server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "audit_code",
        description:
          "Analisa estaticamente um trecho de código JSX/TSX contra clichês visuais de IA (paletas roxas genéricas, split heroes previsíveis, ausência de escala monumental, blur-blobs artificiais, caixas de ícone genéricas, etc.). Utilize esta ferramenta para validar se o front-end sugerido cumpre os padrões estéticos do Microspark.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Código JSX/TSX completo a ser auditado.",
            },
            filePath: {
              type: "string",
              description: "Nome ou caminho relativo do arquivo (ex: 'Hero.tsx').",
            },
          },
          required: ["code"],
        },
      },
      {
        name: "audit_file",
        description:
          "Lê e analisa um arquivo TSX/JSX local do projeto para identificar violações estéticas e padrões de AI aesthetic slop.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Caminho relativo ou absoluto para o arquivo TSX/JSX no disco.",
            },
          },
          required: ["filePath"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "audit_code") {
      const code = String(args?.code || "");
      const filePath = String(args?.filePath || "component.tsx");

      const result = auditCode(code, { filePath });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                valid: result.valid,
                totalViolations: result.violations.length,
                violations: result.violations.map((v) => ({
                  rule: v.ruleId,
                  severity: v.severity,
                  message: v.message,
                  location: `Linha ${v.line}, Coluna ${v.column}`,
                  fixHint: v.fixHint,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "audit_file") {
      const filePath = String(args?.filePath || "");
      const resolvedPath = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(process.cwd(), filePath);

      const result = await auditFile(resolvedPath);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                file: result.filePath,
                valid: result.valid,
                totalViolations: result.violations.length,
                violations: result.violations.map((v) => ({
                  rule: v.ruleId,
                  severity: v.severity,
                  message: v.message,
                  location: `Linha ${v.line}, Coluna ${v.column}`,
                  fixHint: v.fixHint,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new Error(`Tool desconhecida: ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Erro ao executar auditoria: ${error.message}`,
        },
      ],
    };
  }
});


export async function startMcpServer(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Microspark MCP Server conectado e escutando via stdio.");
}

// Se executado diretamente como CLI/processo
if (process.argv[1] && (process.argv[1].endsWith("index.js") || process.argv[1].endsWith("index.ts") || process.argv[1].includes("microspark-mcp"))) {
  startMcpServer().catch((error) => {
    console.error("Falha fatal ao iniciar Microspark MCP Server:", error);
    process.exit(1);
  });
}
