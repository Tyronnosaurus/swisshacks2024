"use client"
import React from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"


interface Data {
    [section: string]: {
        [kpi: string]: [number | string, number | string];
    };
}

const data: Data = {
    basics: {
        "Fund size": [83727, 71619], // values in millions
        "Total expense ratio": ["0.07% p.a.", "0.20% p.a."],
        "Replication": ["Physical", "Physical"],
        "Legal structure": ["ETF", "ETF"],
        "Strategy risk": ["Long-only", "Long-only"],
        "Fund currency": ["USD", "USD"],
        "Currency risk": ["Currency unhedged", "Currency unhedged"],
        "Volatility 1 year (in EUR)": ["11.57%", "9.91%"],
        "Inception/ Listing Date": ["19 May 2010", "25 September 2009"],
        "Distribution policy": ["Accumulating", "Accumulating"]
    },
    profitability: {
        "Net Income": [5000, 4800], // values in millions
        "Return on Assets (ROA)": ["5.5%", "5.2%"],
        "Return on Equity (ROE)": ["12.5%", "12.0%"],
    },
    growth: {
        "Revenue Growth": ["8%", "7.5%"],
        "Net Income Growth": ["10%", "9%"],
        "EPS Growth": ["6%", "5.8%"],
    },
    solvency: {
        "Current Ratio": ["1.5", "1.6"],
        "Quick Ratio": ["1.2", "1.3"],
        "Debt to Equity Ratio": ["0.8", "0.75"],
    },
};

const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
        return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2 }).format(value);
    }
    return value;
};

const ComparisonTable: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Company Comparison</h2>
            {Object.entries(data).map(([section, kpis]) => (
                <div key={section} className="mb-8">
                    <h3 className="text-xl font-semibold mb-2 capitalize">{section}</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>KPI</TableHead>
                                <TableHead>Company A</TableHead>
                                <TableHead>Company B</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(kpis).map(([kpi, values]) => (
                                <TableRow key={kpi}>
                                    <TableCell>{kpi}</TableCell>
                                    <TableCell>{formatValue(values[0])}</TableCell>
                                    <TableCell>{formatValue(values[1])}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ))}
        </div>
    );
};

export default ComparisonTable;
