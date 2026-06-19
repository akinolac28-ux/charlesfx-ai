import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { Candle } from '@/types';

export function CandlestickChart({ candles, height = 380 }: { candles: Candle[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: '#9AA3B8',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(201,161,74,0.06)' },
        horzLines: { color: 'rgba(201,161,74,0.06)' },
      },
      timeScale: {
        borderColor: 'rgba(201,161,74,0.15)',
        timeVisible: true,
        secondsVisible: true,
      },
      rightPriceScale: {
        borderColor: 'rgba(201,161,74,0.15)',
      },
      crosshair: {
        vertLine: { color: 'rgba(31,111,235,0.5)', labelBackgroundColor: '#1F6FEB' },
        horzLine: { color: 'rgba(201,161,74,0.5)', labelBackgroundColor: '#C9A14A' },
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#16C784',
      downColor: '#F0506E',
      borderUpColor: '#16C784',
      borderDownColor: '#F0506E',
      wickUpColor: '#16C784',
      wickDownColor: '#F0506E',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;
    const data: CandlestickData[] = candles.map(c => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return <div ref={containerRef} style={{ width: '100%', height }} />;
}
