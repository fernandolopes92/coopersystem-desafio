import {Component, OnInit} from '@angular/core';
import {DataService} from "../../shared/services/data.service";
import {Investimento} from "../../shared/interfaces/investimento";
import {InvestimentoService} from "../../shared/services/investimento.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ModalResgateComponent} from "../modal-resgate/modal-resgate.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-investimento-resgate',
  templateUrl: './investimento-resgate.component.html',
  styleUrls: ['./investimento-resgate.component.scss']
})
export class InvestimentoResgateComponent implements OnInit {

  listaInvestimentos: Array<Investimento> = [];

  investimento: Investimento;
  resgate: Array<number> = [];

  saldosAcumulados: Array<number> = [];

  params: any;

  constructor(private service: InvestimentoService,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private router: Router) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.params = params;

      this.listarInvestimentos();
    });
  }

  listarInvestimentos() {
    this.service.listarInvestimentos().subscribe((response: any) => {
      this.listaInvestimentos = response.response.data.listaInvestimentos;

      for (let i = 0; i < this.listaInvestimentos.length; i++) {
        let inv = this.listaInvestimentos[i];
        if (inv.nome === this.params.nome) {
          this.investimento = inv;
          break;
        }
      }

      this.calculaSaldosAcumulados();
    })
  }


  calculoResgate(): number {
    let soma: number = 0;
    this.resgate.forEach(r => {
      soma += Number(r);
    })

    return soma;
  }

  temErroResgate(ind: number): boolean {
    return this.resgate[ind] > this.saldosAcumulados[ind];
  }

  calculaSaldosAcumulados() {
    this.saldosAcumulados = [];
    this.investimento.acoes.forEach(acao => {
      const saldoAcumulado = this.investimento.saldoTotal * acao.percentual / 100;
      this.saldosAcumulados.push(saldoAcumulado);
    })
  }

  abrirModal(): void {
    const dialogRef = this.dialog.open(ModalResgateComponent, {
      data: {
        investimento: this.investimento,
        saldosAcumulados: this.saldosAcumulados,
        resgate: this.resgate
      }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.sucesso) {
        this.voltarParaListagem();
      }
    });
  }

  voltarParaListagem(): void {
    this.router.navigate(['/investimento/listagem']);
  }
}
