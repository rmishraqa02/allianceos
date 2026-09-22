import {
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';

import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

@Injectable()
export class McpClientService
  implements OnModuleDestroy
{
  private readonly logger =
    new Logger(McpClientService.name);

  private client: Client | null = null;

  private transport:
    | StdioClientTransport
    | null = null;

  private connected = false;

  private readonly mcpServerPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../mcp/deal-mcp/dist/index.js',
  );

  private async connect(): Promise<void> {
    if (this.connected && this.client) {
      return;
    }

    this.logger.log(
      'Starting AllianceOS Deal MCP server...',
    );

    this.logger.log(
      `MCP server path: ${this.mcpServerPath}`,
    );

    this.transport =
      new StdioClientTransport({
        command: 'node',
        args: [this.mcpServerPath],
      });

    this.client = new Client(
      {
        name: 'allianceos-gtm-agent',
        version: '1.0.0',
      },
      {
        capabilities: {},
      },
    );

    await this.client.connect(
      this.transport,
    );

    this.connected = true;

    this.logger.log(
      'Connected to AllianceOS Deal MCP server',
    );
  }

  async callTool<T = unknown>(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<T> {
    await this.connect();

    if (!this.client) {
      throw new Error(
        'MCP client is not initialized',
      );
    }

    this.logger.log(
      `Calling MCP tool: ${toolName}`,
    );

    const result =
      await this.client.callTool({
        name: toolName,
        arguments: args,
      });

    if (result.isError) {
      const text =
        this.extractText(result);

      throw new Error(
        `MCP tool "${toolName}" failed: ${text}`,
      );
    }

    return this.parseResult<T>(result);
  }

  private extractText(
    result: any,
  ): string {
    if (!Array.isArray(result.content)) {
      return 'Unknown MCP error';
    }

    return result.content
      .filter(
        (item: any) =>
          item?.type === 'text',
      )
      .map(
        (item: any) =>
          item.text,
      )
      .join('\n');
  }

  private parseResult<T>(
    result: any,
  ): T {
    const text =
      this.extractText(result);

    if (!text) {
      return result as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }

  async listTools() {
    await this.connect();

    if (!this.client) {
      throw new Error(
        'MCP client is not initialized',
      );
    }

    return this.client.listTools();
  }

  async onModuleDestroy() {
    if (this.transport) {
      try {
        await this.transport.close();
      } catch (error) {
        this.logger.warn(
          'Failed to close MCP transport cleanly',
        );
      }
    }

    this.connected = false;
    this.client = null;
    this.transport = null;
  }
}