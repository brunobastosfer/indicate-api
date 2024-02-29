import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpsAgent } from 'agentkeepalive';
import axios from 'axios';
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

  getToken = async () => {
    const certificado = fs.readFileSync(
      this.configService.get('GN_CERTIFICADO'),
    );
    const credenciais = {
      client_id: this.configService.get('GN_CLIENT_ID'),
      client_secret: this.configService.get('GN_CLIENT_SECRET'),
    };
    const data = JSON.stringify({ grant_type: 'client_credentials' });
    const dataCredenciais =
      credenciais.client_id + ':' + credenciais.client_secret;
    const auth = Buffer.from(dataCredenciais).toString('base64');

    const agent = new HttpsAgent({
      pfx: certificado,
      passphrase: '',
    });

    const config = {
      method: 'POST',
      url: this.baseURL + '/oauth/token',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json',
      },
      httpsAgent: agent,
      data: data,
    };

    const result = await axios(config);
    return result.data;
  };

  createCharge = async (access_token, chargeData) => {
    const certificado = fs.readFileSync(
      this.configService.get('GN_CERTIFICADO'),
    );
    const data = JSON.stringify(chargeData);

    const agent = new HttpsAgent({
      pfx: certificado,
      passphrase: '',
    });

    const config = {
      method: 'POST',
      url: this.baseURL + '/v2/cob',
      headers: {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json',
      },
      httpsAgent: agent,
      data: data,
    };
    const result = await axios(config);
    return result.data;
  };

  getLoc = async (access_token, locId) => {
    const certificado = fs.readFileSync(
      this.configService.get('GN_CERTIFICADO'),
    );

    const agent = new HttpsAgent({
      pfx: certificado,
      passphrase: '',
    });

    const config = {
      method: 'GET',
      url: this.baseURL + '/v2/loc/' + locId + '/qrcode',
      headers: {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json',
      },
      httpsAgent: agent,
    };

    const result = await axios(config);
    return result.data;
  };

  run = async () => {
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
      chave,
      solicitacaoPagador: 'Cobrança dos serviços prestados',
    };
    const charge = await this.createCharge(access_token, chargeData);
    const qrcode = await this.getLoc(access_token, charge.loc.id);
    return qrcode;
  };
}
