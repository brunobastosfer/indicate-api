import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpsAgent } from 'agentkeepalive';
import axios, { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';

@Injectable()
export class PixService {
  private readonly apiProduction = 'https://pix.api.efipay.com.br';
  private readonly apiStaging = 'https://pix-h.api.efipay.com.br';
  private readonly baseURL: string;

  constructor(private readonly configService: ConfigService) {
    this.baseURL =
      this.configService.get('GN_ENV') === 'producao'
        ? this.apiProduction
        : this.apiStaging;
  }

  private getHttpsAgent(): HttpsAgent {
    const certificado = fs.readFileSync(
      this.configService.get('GN_CERTIFICADO'),
    );

    return new HttpsAgent({
      pfx: certificado,
      passphrase: '',
    });
  }

  private getAuthHeader(): string {
    const credenciais = {
      client_id: this.configService.get('GN_CLIENT_ID'),
      client_secret: this.configService.get('GN_CLIENT_SECRET'),
    };
    const dataCredenciais =
      credenciais.client_id + ':' + credenciais.client_secret;
    const auth = Buffer.from(dataCredenciais).toString('base64');
    return 'Basic ' + auth;
  }

  private async sendRequest(config: AxiosRequestConfig): Promise<any> {
    const agent = this.getHttpsAgent();
    const headers = {
      Authorization: this.getAuthHeader(),
      'Content-Type': 'application/json',
    };

    const httpsConfig: AxiosRequestConfig = {
      ...config,
      httpsAgent: agent,
      headers,
    };

    const response = await axios(httpsConfig);
    return response.data;
  }

  async getToken(): Promise<any> {
    const data = JSON.stringify({ grant_type: 'client_credentials' });
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: this.baseURL + '/oauth/token',
      data,
    };

    return await this.sendRequest(config);
  }

  async createCharge(access_token: string, chargeData: any): Promise<any> {
    const data = JSON.stringify(chargeData);
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: this.baseURL + '/v2/cob',
      headers: {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json',
      },
      data,
    };

    return await this.sendRequest(config);
  }

  async getLoc(access_token: string, locId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: this.baseURL + '/v2/loc/' + locId + '/qrcode',
      headers: {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json',
      },
    };

    return await this.sendRequest(config);
  }

  async run(): Promise<void> {
    const chave = this.configService.get('CHAVE_PIX');
    const { access_token } = await this.getToken();
    const chargeData = {
      calendario: {
        expiracao: 3600,
      },
      devedor: {
        cpf: '05717713355',
        nome: 'Bruno Bastos',
      },
      valor: {
        original: '130.50',
      },
      chave, // Pelo app do gerenciaNet
      solicitacaoPagador: 'Cobrança dos serviços prestados',
    };
    const charge = await this.createCharge(access_token, chargeData);
    console.log(charge);
    // const qrcode = await this.getLoc(access_token, charge.loc.id);

    return null;
  }
}
