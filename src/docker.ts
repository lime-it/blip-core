import execa = require('execa');
import {DockerMachineEnv} from './docker-machine'
import { ToolingDependecy } from './model';
import { CLIError } from '@oclif/errors';

export interface DockerPsResult{
    id?: string;
    image?: string;
    command?: string;
    createdAt?: string;
    runningFor?: string;
    ports?: string;
    status?: 'created'|'restarting'|'running'|'removing'|'paused'|'exited'|'dead';
    size?: string;
    names?: string;
    labels?: string;
    mounts?: string;
    networks?: string;
}

export abstract class DockerTool extends ToolingDependecy{
  abstract ps(machineEnvVars: DockerMachineEnv, ...fields: (keyof DockerPsResult)[]): Promise<DockerPsResult[]>;
}

class DockerToolImpl extends DockerTool {
  async isPresent(): Promise<boolean> {
    const {exitCode} = await execa('docker', ['-v']);
    return exitCode == 0;
  }
  protected toolMissingMessage():string{
    return `Docker is missing from the current environment. Please check https://docs.docker.com/engine/install/`;
  }

  async ps(machineEnvVars: DockerMachineEnv, ...fields: (keyof DockerPsResult)[]): Promise<DockerPsResult[]> {
    await this.ensurePresent();
    
    fields = fields && fields.length > 0 ? fields : ['id', 'image', 'command', 'createdAt', 'runningFor', 'ports', 'status', 'size', 'names', 'labels', 'mounts', 'networks']
    if(!fields.includes('id'))
      fields.push('id');
    const format = fields.map(p => p === 'id' ? '{{.ID}}' : `{{.${(p.charAt(0).toUpperCase() + p.substring(1))}}}`).join('|')

    const {stdout} = await execa('docker', ['ps', '-a', '--format', format], {env: machineEnvVars as any || process.env })
    const results = stdout.split('\n').filter(p => p.length > 0).map(row => {
      const item: DockerPsResult = {}
      row.split('|').forEach((value, i) => {
        item[fields[i]] = value as any
      })
      return item
    });

    if(fields.includes('status') && results.length > 0){
      const realStatuses = (await execa('docker', ['inspect', '--format', '"{{.ID}}|{{.State.Status}}"', ...results.map(p => p.id!)], {env: machineEnvVars as any || process.env }))
        .stdout.split('\n').map(line=>line.split('|')).reduce((acc, items)=>{acc[items[0]]=items[1]; return acc;}, {} as {[key:string]:string});
  
      results.forEach(p => p.status = realStatuses[p.id!] as any);
    }

    return results;
  }
}

export const Docker:DockerTool = new DockerToolImpl();