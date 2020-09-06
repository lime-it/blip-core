import execa = require('execa');
import {DockerMachineEnv} from './docker-machine'
import { ToolingDependecy } from './model';
import { CLIError } from '@oclif/errors';
import { DockerPsResult, Docker } from './docker';

export abstract class DockerComposeTool extends ToolingDependecy{
  abstract ps(machineEnvVars: DockerMachineEnv, filePath: string): Promise<DockerPsResult[]>;
  abstract up(machineEnvVars: DockerMachineEnv, filePath: string): Promise<void>;
  abstract down(machineEnvVars: DockerMachineEnv, filePath: string): Promise<void>;
  abstract start(machineEnvVars: DockerMachineEnv, filePath: string): Promise<void>;
  abstract stop(machineEnvVars: DockerMachineEnv, filePath: string): Promise<void>;
}

class DockerComposeToolImpl extends DockerComposeTool {
  async isPresent(): Promise<boolean> {
    const {exitCode} = await execa('docker-compose', ['-v']);
    return exitCode == 0;
  }
  protected toolMissingMessage():string{
    return `Docker compose is missing from the current environment. Please check https://docs.docker.com/compose/install/`;
  }

  async ps(machineEnvVars: DockerMachineEnv, filePath: string = 'docker-compose.yml'): Promise<DockerPsResult[]> {
    await this.ensurePresent();
    
    const containers = await Docker.ps(machineEnvVars);

    const {stdout} = await execa('docker-compose', ['-f', filePath, 'ps', '-q'], {env: machineEnvVars as any || process.env })
    const composeIds = stdout.split('\n').map(p => p.trim());

    return containers.filter(p => composeIds.indexOf(p.id!));
  }

  async up(machineEnvVars: DockerMachineEnv, filePath: string = 'docker-compose.yml'): Promise<void> {
    await execa('docker-compose', ['-f', filePath, 'up', '-d'], {env: machineEnvVars as any || process.env });
  }
  async down(machineEnvVars: DockerMachineEnv, filePath: string = 'docker-compose.yml'): Promise<void> {
    await execa('docker-compose', ['-f', filePath, 'down'], {env: machineEnvVars as any || process.env });
  }
  async start(machineEnvVars: DockerMachineEnv, filePath: string = 'docker-compose.yml'): Promise<void> {
    await execa('docker-compose', ['-f', filePath, 'start'], {env: machineEnvVars as any || process.env });
  }
  async stop(machineEnvVars: DockerMachineEnv, filePath: string = 'docker-compose.yml'): Promise<void> {
    await execa('docker-compose', ['-f', filePath, 'stop'], {env: machineEnvVars as any || process.env });
  }
}

export const DockerCompose:DockerComposeTool = new DockerComposeToolImpl();