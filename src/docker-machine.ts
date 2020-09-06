import * as execa from 'execa'
import { ToolingDependecy } from './model';
import { CLIError } from '@oclif/errors';

export type DockerMachineListField='name'|'active'|'driver'|'state'|'url'|'swarm'|'docker'|'errors';

export type DockerMachineState = 'Running'|'Paused'|'Saved'|'Stopped'|'Stopping'|'Starting'|'Error'|'Timeout';

export interface DockerMachineListResult{
  name?: string;
  active?: string;
  activeHost?: string;
  activeSwarm?: string;
  driverName?: string;
  state?: DockerMachineState;
  URL?: string;
  swarm?: string;
  error?: string;
  dockerVersion?: string;
  responseTime?: string;
}

export function isMachineStarty(state: DockerMachineState){
  return state == 'Running' || state == 'Starting';
}

export function isMachineStoppy(state: DockerMachineState){
  return state == 'Stopped' || state == 'Stopping' || state == 'Paused';
}

export function isMachineStuck(state: DockerMachineState){
  return state == 'Error' || state == 'Timeout';
}

export interface DockerMachineEnv{
  DOCKER_TLS_VERIFY: string;
  DOCKER_HOST: string;
  DOCKER_CERT_PATH: string;
  DOCKER_MACHINE_NAME: string;
  COMPOSE_CONVERT_WINDOWS_PATHS: string;
}

export function getMachineAddress(env: DockerMachineEnv): string {
  // eslint-disable-next-line no-useless-escape
  return (/^[^:]+:\/\/([0-9\.]+):\d+$/.exec(env.DOCKER_HOST) || [])[1]
}

export interface DockerMachineCreateOptions{
  driver: string;
  engineRegistryMirror: string[]|null;
  engineInsecureRegistry: string[]|null;
}

const defaultOptions: DockerMachineCreateOptions = {
  driver: 'virtualbox',
  engineRegistryMirror: null,
  engineInsecureRegistry: null,
}

export abstract class DockerMachineTool extends ToolingDependecy {
  abstract ls(...fields: (keyof DockerMachineListResult)[]):Promise<DockerMachineListResult[]>;
  abstract create(name: string, options: Partial<DockerMachineCreateOptions>, direverOptions: {[key: string]: string}):Promise<void>;
  abstract env(name: string, shell: string):Promise<DockerMachineEnv>;
  abstract envStdout(name: string, shell: string):Promise<string>;
  abstract start(name: string):Promise<void>;
  abstract stop(name: string):Promise<void>;
  abstract remove(name: string):Promise<void>;
}

class DockerMachineToolImpl extends DockerMachineTool {
  async isPresent(): Promise<boolean> {
    const {exitCode} = await execa('docker-machine', ['-v']);
    return exitCode == 0;
  }
  protected toolMissingMessage():string{
    return `Docker machine is missing from the current environment. Please check https://docs.docker.com/machine/install-machine/`;
  }

  async ls(...fields: (keyof DockerMachineListResult)[]) {
    await this.ensurePresent();

    fields = fields && fields.length > 0 ? fields : ['name', 'active', 'activeHost', 'activeSwarm', 'driverName', 'state', 'URL', 'swarm', 'error', 'dockerVersion', 'responseTime']
    const format = fields.map(p => `{{.${(p.charAt(0).toUpperCase() + p.substring(1))}}}`).join('|')

    const {stdout} = await execa('docker-machine', ['ls', '--format', format])
    return stdout.split('\n').filter(p => p.length > 0).map(row => {
      const item: DockerMachineListResult = {}
      row.split('|').forEach((value, i) => {
        item[fields[i]] = value as any
      })
      return item
    })
  }

  async create(name: string, options: Partial<DockerMachineCreateOptions> = defaultOptions, direverOptions: {[key: string]: string} = {}) {
    await this.ensurePresent();

    if (!name || name.trim().length === 0)
      throw new Error('\'name\' must be set')
    
    const machineList = await DockerMachine.ls()
    if (!!(machineList as DockerMachineListResult[]).find(p => p.name === name)) 
      return;

    const commandOptions: string[] = []
    Object.keys(options).filter(p => Boolean((options as any)[p])).map(p => ({key: p, option: '--' + p.replace(/([A-Z])/g, '-$1').toLowerCase()})).forEach(p => {
      if (Array.isArray((options as any)[p.key])) {
        (options as any)[p.key].forEach((value: string) => {
          commandOptions.push(p.option)
          commandOptions.push(value)
        })
      } else {
        commandOptions.push(p.option)
        if ((options as any)[p.key] !== true)
          commandOptions.push((options as any)[p.key])
      }
    })

    Object.keys(direverOptions).forEach(key => {
      commandOptions.push(key)
      if (direverOptions[key] !== null && direverOptions[key]!==undefined)
        commandOptions.push(direverOptions[key])
    })

    await execa('docker-machine', ['create', name, ...commandOptions])
  }

  async env(name: string, shell = 'bash') {
    await this.ensurePresent();

    if (!name || name.trim().length === 0)
      throw new Error('\'name\' must be set')

    const {stdout} = await execa('docker-machine', ['env', name, '--shell', shell])

    const regex = /^export\s+([^=]+)="([^"]+)"$/
    const vars = stdout.split('\n').filter(p => !p.startsWith('#')).reduce((acc, line) => {
      const m = regex.exec(line) || []
      acc[m[1]] = m[2]
      return acc
    }, {} as any)

    return vars as DockerMachineEnv
  }

  async envStdout(name: string, shell = 'bash') {
    await this.ensurePresent();

    if (!name || name.trim().length === 0)
      throw new Error('\'name\' must be set')

    const {stdout} = await execa('docker-machine', ['env', name, '--shell', shell])

    return stdout
  }

  async start(name: string) {
    await this.ensurePresent();

    if (!name || name.trim().length === 0)
      throw new Error('\'name\' must be set')

    await execa('docker-machine', ['start', name])
  }

  async stop(name: string) {
    await this.ensurePresent();

    if (!name || name.trim().length === 0)
      throw new Error('\'name\' must be set')

    await execa('docker-machine', ['stop', name])
  }

  async remove(name: string) {
    await this.ensurePresent();
    
    if (!name || name.trim().length === 0)
      throw new Error('\'name\' must be set')

    await execa('docker-machine', ['rm', '--force', name])
  }
}

export const DockerMachine:DockerMachineTool = new DockerMachineToolImpl();