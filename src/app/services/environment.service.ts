import { Injectable } from '@angular/core';
import {EnvVars} from "../models";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  private envConfig: EnvVars = {
    hostname: ''
  };

  constructor(private readonly http: HttpClient) {}

  async loadEnvConfig(configPath: string): Promise<void> {
    console.log('Loading environment config!');
    this.envConfig = await this.http.get<EnvVars>(configPath).toPromise();
  }

  getEnvConfig(): EnvVars {
    return this.envConfig;
  }
}
