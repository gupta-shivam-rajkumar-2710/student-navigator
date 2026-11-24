"use client";

import { useMemo, useState } from "react";

const views = [
  ["average", "Average CTC"],
  ["median", "Median CTC"],
  ["comparison", "Average vs median"],
];

export default function BranchCharts({ rows }) {
  const [view, setView] = useState("average");
  const chart = useMemo(() => {
    const available = rows.filter(row => row.averageCtc != null || row.medianCtc != null);
    const max = Math.max(10, ...available.flatMap(row => [row.averageCtc, row.medianCtc]).filter(value => value != null));
    const step = max <= 30 ? 5 : max <= 60 ? 10 : 20;
    const axisMax = Math.ceil(max / step) * step;
    return { available, step, axisMax };
  }, [rows]);

  const width = 760;
  const height = 340;
  const left = 48;
  const right = 16;
  const top = 18;
  const bottom = 54;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const ticks = Array.from({ length: Math.floor(chart.axisMax / chart.step) + 1 }, (_, index) => index * chart.step);
  const groupWidth = plotWidth / Math.max(chart.available.length, 1);
  const series = view === "comparison"
    ? [{ key: "averageCtc", label: "Average CTC", color: "#879bff" }, { key: "medianCtc", label: "Median CTC", color: "#55c3d3" }]
    : [{ key: view === "average" ? "averageCtc" : "medianCtc", label: view === "average" ? "Average CTC" : "Median CTC", color: view === "average" ? "#879bff" : "#55c3d3" }];
  const barGap = 5;
  const barWidth = Math.min(view === "comparison" ? 19 : 31, groupWidth / (series.length + 1));

  return <div className="branch-charts">
    <div className="branch-chart-head"><div><span className="eyebrow accent">BRANCH OUTCOMES · LPA</span><h3>Compare CTC by department</h3><p>Unavailable branches are excluded from the numeric chart.</p></div><div className="chart-tabs" role="tablist" aria-label="Placement chart type">{views.map(([key, label]) => <button key={key} className={view === key ? "chart-tab-active" : ""} role="tab" aria-selected={view === key} onClick={() => setView(key)}>{label}</button>)}</div></div>
    <div className="branch-chart-scroll"><svg className="branch-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${views.find(([key]) => key === view)?.[1]} by IIT Madras B.Tech department, in lakh rupees per annum`}>
      <title>{views.find(([key]) => key === view)?.[1]} by department (LPA)</title>
      {ticks.map(tick => { const y = top + plotHeight - (tick / chart.axisMax) * plotHeight; return <g key={tick}><line x1={left} x2={width - right} y1={y} y2={y} stroke="#252d3c" strokeDasharray={tick === 0 ? "0" : "3 5"}/><text x={left - 9} y={y + 3} textAnchor="end" fill="#7f8ba1" fontSize="9">{tick}</text></g>; })}
      {chart.available.map((row, index) => {
        const center = left + groupWidth * index + groupWidth / 2;
        const visibleSeries = series.filter(item => row[item.key] != null);
        const totalWidth = visibleSeries.length * barWidth + Math.max(0, visibleSeries.length - 1) * barGap;
        return <g key={row.departmentCode}>
          {visibleSeries.map((item, seriesIndex) => {
            const value = row[item.key];
            const barHeight = (value / chart.axisMax) * plotHeight;
            const x = center - totalWidth / 2 + seriesIndex * (barWidth + barGap);
            const y = top + plotHeight - barHeight;
            return <g key={item.key}><rect x={x} y={y} width={barWidth} height={barHeight} rx="3" fill={item.color} opacity=".9"><title>{row.departmentCode} · {item.label}: {value.toFixed(1)} LPA</title></rect>{!seriesIndex && view !== "comparison" && <text x={x + barWidth / 2} y={y - 7} fill="#c5cde0" fontSize="8" textAnchor="middle">{value.toFixed(1)}</text>}</g>;
          })}
          <text x={center} y={top + plotHeight + 19} fill="#aab4c7" fontSize="9" textAnchor="middle">{row.departmentCode}</text>
        </g>;
      })}
      <text transform={`translate(13 ${top + plotHeight / 2}) rotate(-90)`} fill="#7f8ba1" fontSize="9" textAnchor="middle">CTC (LPA)</text>
    </svg></div>
    <div className="branch-chart-legend">{series.map(item => <span key={item.key}><i style={{ background: item.color }}/>{item.label}</span>)}</div>
  </div>;
}
