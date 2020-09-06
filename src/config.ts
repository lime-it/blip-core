import {readFile, writeFile, existsSync, mkdirp} from 'fs-extra'
import {join, sep} from 'path';
import * as YAML from 'yaml'
import { BlipWorkspace, GlobalBlipConfiguration } from './model';
import {CLIError} from '@oclif/errors';
import { environment } from './environment';

const { version } = require('./package.json');

const currentWorkingDirectory = process.cwd();

export interface BlipConfiguration {
  currentWorkingDir: string;
  workspaceConfigFile: string;
  workspaceConfigPath: string;
  globalConfigFilePath: string;
  isWorkspace: boolean;
  getWorkspaceRootPath(): string;
  createWorkspace(): Promise<void>;
  readWorkspace(): Promise<BlipWorkspace>;
  overwriteWorkspace(model:BlipWorkspace):Promise<void>;
  readGlobalConfiguration():Promise<GlobalBlipConfiguration>;
  overwriteGlobalConfiguration(model:GlobalBlipConfiguration):Promise<void>;

  throwIfNotInWorkspace():void;
}

class BlipConfigurationImpl implements BlipConfiguration{
  get currentWorkingDir():string{
    return currentWorkingDirectory;
  }
  get workspaceConfigFile():string{
    return join(this.getWorkspaceRootPath(), "blip.yml");
  }
  get workspaceConfigPath():string{
    return join(this.getWorkspaceRootPath(), ".blip");
  }
  get globalConfigFilePath():string{
    return join(environment.configDir, "config.yml");
  }

  get isWorkspace():boolean{
    return existsSync(this.workspaceConfigFile) && existsSync(this.workspaceConfigPath);
  }

  getWorkspaceRootPath(): string {
    return currentWorkingDirectory.split(sep)
    .reduce((acc, current, index, original)=> acc.length==0 ? original.map(x=>[current]) : acc.map((p, i)=> i>=original.length-index ? p : [...p, current]), [] as string[][])
    .map(p => join(...p))
    .find(p => existsSync(join(p, "blip.yml")) && existsSync(join(p, ".blip"))) || currentWorkingDirectory;
  }

  async createWorkspace(): Promise<void> {
    if(!this.isWorkspace){
      await writeFile(this.workspaceConfigFile, YAML.stringify({version:version, defaultMachine: null, machines: {}}));
      await mkdirp(this.workspaceConfigPath);
    }
  }

  async readWorkspace():Promise<BlipWorkspace>{
    this.throwIfNotInWorkspace();
    return YAML.parse(await readFile(this.workspaceConfigFile, 'utf8')) as BlipWorkspace;
  }

  async overwriteWorkspace(model:BlipWorkspace):Promise<void>{
    this.throwIfNotInWorkspace();
    return await writeFile(this.workspaceConfigFile, YAML.stringify(model));
  }

  async readGlobalConfiguration():Promise<GlobalBlipConfiguration>{
    if (!existsSync(this.globalConfigFilePath)){
      const conf = {defaultDriver:null, workspaces:{}};
      await this.overwriteGlobalConfiguration(conf);
      return conf;
    }
    else
      return YAML.parse(await readFile(this.globalConfigFilePath, 'utf8')) as GlobalBlipConfiguration
  }

  async overwriteGlobalConfiguration(model:GlobalBlipConfiguration):Promise<void>{
    this.ensureGlobalConfigPathExists();
    await writeFile(this.globalConfigFilePath, YAML.stringify(model))
  }
  
  throwIfNotInWorkspace():void {
    if (!this.isWorkspace)
      throw new CLIError('Not in a blip workspace.');
  }

  private async ensureGlobalConfigPathExists(){
    await mkdirp(environment.configDir);
  }
}

export const BlipConf:BlipConfiguration = new BlipConfigurationImpl();
