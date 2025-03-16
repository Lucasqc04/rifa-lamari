import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Entrada {
  id: string;
  whatsapp: string;
  name?: string;
  paid?: boolean;
  createdAt?: any;
  criadoEm: Date;
}

interface Comprador {
  nome: string;
  bilhetes: number;
}

const Dashboard: React.FC = () => {
  const [entradas, setEntradas] = useState<Entrada[]>([]);

  useEffect(() => {
    const buscarEntradas = async () => {
      const colecaoEntradas = collection(db, "entries");
      const snapshot = await getDocs(colecaoEntradas);
      const listaEntradas = snapshot.docs.map((doc) => {
        const dados = doc.data();
        return {
          id: doc.id,
          ...dados,
          // Converte o Timestamp do Firebase para Date
          criadoEm: dados.createdAt
            ? new Date(dados.createdAt.seconds * 1000)
            : new Date(),
        } as Entrada;
      });
      setEntradas(listaEntradas);
    };

    buscarEntradas();
  }, []);

  // Indicadores gerais
  const totalEntradas = entradas.length;
  const faturamentoTotal = totalEntradas * 10; // Cada bilhete é R$10

  // Média de bilhetes por comprador (agrupando por número de WhatsApp)
  const compradoresUnicos = new Set(entradas.map((e) => e.whatsapp)).size;
  const mediaBilhetesComprador =
    compradoresUnicos > 0 ? (totalEntradas / compradoresUnicos).toFixed(2) : "0";

  // Projeção de faturamento
  const faturamentoProjetado = 200 * 10; // 200 bilhetes totais
  const progressoFaturamento = (
    (faturamentoTotal / faturamentoProjetado) *
    100
  ).toFixed(2);

  // Vendas por Dia – agrupa por data (em R$)
  const mapaVendasDiarias = entradas.reduce((acc, entrada) => {
    const dataStr = entrada.criadoEm.toLocaleDateString("pt-BR");
    acc[dataStr] = (acc[dataStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Converte a data (formato "dd/mm/yyyy") para timestamp para ordenação correta
  const dadosVendasDiarias = Object.keys(mapaVendasDiarias)
    .map((data) => {
      const [dia, mes, ano] = data.split("/");
      return {
        data,
        vendas: mapaVendasDiarias[data] * 10,
        quantidade: mapaVendasDiarias[data],
        timestamp: new Date(+ano, +mes - 1, +dia).getTime(),
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  // Histórico de Arrecadação Acumulada
  let acumulado = 0;
  const dadosArrecadacaoAcumulada = dadosVendasDiarias.map((item) => {
    acumulado += item.vendas;
    return { data: item.data, arrecadacaoAcumulada: acumulado };
  });

  // Comparação entre Dias da Semana
  const nomesDiasSemana = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  const mapaDiasSemana = entradas.reduce((acc, entrada) => {
    const dia = entrada.criadoEm.getDay();
    const nomeDia = nomesDiasSemana[dia];
    acc[nomeDia] = (acc[nomeDia] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosDiasSemana = nomesDiasSemana.map((dia) => ({
    dia,
    quantidade: mapaDiasSemana[dia] || 0,
  }));

  // Distribuição de Pagamentos
  // "Em Branco": números não escolhidos; "Aguardando Pagamento": escolhidos mas não pagos; "Pago": pagos.
  const entradasPagas = entradas.filter((e) => e.paid).length;
  const entradasNaoPagas = totalEntradas - entradasPagas;
  const entradasEmBranco = 200 - totalEntradas;
  const dadosDistribuicaoPagamentos = [
    { nome: "Em Branco", valor: entradasEmBranco },
    { nome: "Aguardando Pagamento", valor: entradasNaoPagas },
    { nome: "Pago", valor: entradasPagas },
  ];
  const coresPizza = ["#FCE4EC", "#F48FB1", "#E91E63"]; // Tons de rosa

  // Função personalizada para renderizar o label no gráfico de pizza
  const renderCustomLabel = (props: any) => {
    const { x, y, payload } = props;
    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: "12px" }}
      >
        {payload.valor}
      </text>
    );
  };

  // Ranking de Compradores agrupando pelo número de WhatsApp
  const compradorMap = entradas.reduce((acc, entrada) => {
    const numero = entrada.whatsapp;
    if (!acc[numero]) {
      acc[numero] = { nome: entrada.name || numero, bilhetes: 0 };
    }
    acc[numero].bilhetes += 1;
    return acc;
  }, {} as Record<string, Comprador>);

  const rankingCompradores: Comprador[] = Object.values(compradorMap)
    .sort((a, b) => b.bilhetes - a.bilhetes)
    .slice(0, 5);

  return (
    <div className="p-4 max-w-screen-lg mx-auto space-y-6 bg-white">
      <h1 className="text-2xl font-bold text-center text-pink-500 mb-4">
        Painel de Controle
      </h1>

      {/* Indicadores */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Faturamento Total */}
        <div className="bg-pink-500 text-white p-4 rounded-lg shadow-md text-center">
          <h2 className="text-lg font-semibold">Faturamento Total</h2>
          <p className="text-3xl font-bold">
            R$ {faturamentoTotal.toLocaleString()}
          </p>
        </div>
        {/* Média de Bilhetes por Comprador */}
        <div className="bg-pink-500 text-white p-4 rounded-lg shadow-md text-center">
          <h2 className="text-lg font-semibold">
            Média de Bilhetes/Comprador
          </h2>
          <p className="text-3xl font-bold">{mediaBilhetesComprador}</p>
        </div>
        {/* Projeção de Faturamento com destaque */}
        <div className="bg-pink-500 text-white p-4 rounded-lg shadow-md text-center border-4 border-yellow-500">
          <h2 className="text-lg font-semibold">Projeção de Faturamento</h2>
          <p className="text-3xl font-bold">
            R$ {faturamentoProjetado.toLocaleString()}
          </p>
          <p className="mt-2">Progresso: {progressoFaturamento}%</p>
          <div className="w-full bg-white rounded-full h-2 mt-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${progressoFaturamento}%`,
                backgroundColor: "#C2185B", // cor destacada para a barra
              }}
            />
          </div>
        </div>
      </div>

      {/* Vendas por Dia */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-pink-500 mb-2">
          Vendas por Dia
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dadosVendasDiarias}>
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="vendas" stroke="#E91E63" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Histórico de Arrecadação Acumulada */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-pink-500 mb-2">
          Histórico de Arrecadação Acumulada
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dadosArrecadacaoAcumulada}>
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="arrecadacaoAcumulada"
              stroke="#E91E63"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Comparação entre Dias da Semana */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-pink-500 mb-2">
          Comparação entre Dias da Semana
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dadosDiasSemana}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quantidade" fill="#E91E63" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribuição de Pagamentos */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
        <h2 className="text-lg font-semibold text-pink-500 mb-2">
          Distribuição de Pagamentos
        </h2>
        <ResponsiveContainer width={250} height={250}>
          <PieChart>
            <Pie
              data={dadosDistribuicaoPagamentos}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="valor"
              label={renderCustomLabel}
            >
              {dadosDistribuicaoPagamentos.map((_, index) => (
                <Cell
                  key={`celula-${index}`}
                  fill={coresPizza[index % coresPizza.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        {/* Legenda para o gráfico de pizza */}
        <div className="mt-4">
          <div className="flex items-center mb-1">
            <div
              style={{ backgroundColor: "#FCE4EC" }}
              className="w-4 h-4 mr-2 rounded-full"
            ></div>
            <span>Em Branco</span>
          </div>
          <div className="flex items-center mb-1">
            <div
              style={{ backgroundColor: "#F48FB1" }}
              className="w-4 h-4 mr-2 rounded-full"
            ></div>
            <span>Aguardando Pagamento</span>
          </div>
          <div className="flex items-center">
            <div
              style={{ backgroundColor: "#E91E63" }}
              className="w-4 h-4 mr-2 rounded-full"
            ></div>
            <span>Pago</span>
          </div>
        </div>
      </div>

      {/* Ranking de Compradores */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-pink-500 mb-2">
          Top Compradores
        </h2>
        <ul className="space-y-2">
          {rankingCompradores.map((item, index) => (
            <li key={index} className="flex justify-between border-b py-1">
              <span>{item.nome}</span>
              <span className="font-bold">{item.bilhetes} bilhetes</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
