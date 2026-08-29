import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import {
  MCP_TOOL_METADATA,
  McpToolOptions,
} from './decorators/mcp-tool.decorator';
import { McpRegistryService } from './mcp-registry.service';

@Injectable()
export class McpDiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(McpDiscoveryService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly registryService: McpRegistryService,
  ) {}

  onModuleInit() {
    this.discoverTools();
  }

  private discoverTools() {
    const providers = this.discoveryService.getProviders();

    providers
      .filter((wrapper) => wrapper.isDependencyTreeStatic())
      .filter((wrapper) => wrapper.instance)
      .forEach((wrapper) => {
        const { instance } = wrapper;
        const prototype = Object.getPrototypeOf(instance);

        this.metadataScanner
          .getAllMethodNames(prototype)
          .forEach((methodName) => {
            const method = instance[methodName];
            const metadata: McpToolOptions = this.reflector.get(
              MCP_TOOL_METADATA,
              method,
            );

            if (metadata) {
              this.registryService.registerTool({
                ...metadata,
                instance,
                methodName,
              });
            }
          });
      });

    this.logger.log(
      `Discovered ${this.registryService.getTools().length} MCP tools.`,
    );
  }
}
