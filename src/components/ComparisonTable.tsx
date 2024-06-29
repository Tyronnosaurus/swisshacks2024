"use client";
import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { PlusIcon, SparklesIcon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Skeleton } from "@/components/ui/skeleton";

interface Data {
    [section: string]: {
        [kpi: string]: [number | string, number | string];
    };
}

const initialData: Data = {
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

const suggestions = ["Cash Ratio", "ROE", "Net Income Margin"];

const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
        return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 2 }).format(value);
    }
    return value;
};

const kpiSchema = z.object({
    kpiName: z.string().nonempty("KPI name is required"),
});

type KpiFormData = z.infer<typeof kpiSchema>;

const ComparisonTable: React.FC<{ file1: string; file2: string }> = ({ file1, file2 }) => {
    const [selectedSuggestion, setSelectedSuggestion] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [kpiData, setKpiData] = useState<Data>(initialData);
    const [loadingKpi, setLoadingKpi] = useState<string | null>(null);

    const form = useForm<KpiFormData>({
        resolver: zodResolver(kpiSchema),
        defaultValues: {
            kpiName: "",
        },
    });

    const calculateKpi = async ({ fileid1, fileid2, kpiName }: { fileid1: string; fileid2: string; kpiName: string }) => {
        const response = await fetch('/api/calculator', {
            method: 'POST',
            body: JSON.stringify({ fileid1, fileid2, kpiName }),
        });

        if (!response.ok) {
            throw new Error('Failed to calculate KPI');
        }

        const result = await response.json();
        return result;
    };

    const { mutate: calculateKpiMutation, isLoading } = useMutation(calculateKpi, {
        onMutate: ({ kpiName }) => {
            setIsOpen(false);
            setLoadingKpi(kpiName);

            // Add a placeholder for the new KPI
            const newKpiData = { ...kpiData };
            const section = "custom";
            newKpiData[section] = newKpiData[section] || {};
            newKpiData[section][kpiName] = ["Loading...", "Loading..."];
            setKpiData(newKpiData);
        },
        onSuccess: (data) => {
            const newKpiData = { ...kpiData };
            const section = "custom"; // Add a new section for custom KPIs
            newKpiData[section] = newKpiData[section] || {};

            // Add the final calculated KPI result
            newKpiData[section][`${data.formula.kpi_name}`] = [data.kpiResults.file1, data.kpiResults.file2];

            setKpiData(newKpiData);
            setLoadingKpi(null);
        },
        onError: (error: any) => {
            console.error(error.message);
            setLoadingKpi(null);
        }
    });

    const handleSuggestionClick = (suggestion: string) => {
        setSelectedSuggestion(suggestion);
        form.setValue("kpiName", suggestion);
    };

    const handleFormSubmit: SubmitHandler<KpiFormData> = (data) => {
        calculateKpiMutation({ fileid1: file1, fileid2: file2, kpiName: data.kpiName });
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Company Comparison</h2>
            {Object.entries(kpiData).map(([section, kpis]) => (
                <div key={section} className="mb-8">
                    <h3 className="text-xl font-semibold mb-2 capitalize">{section}</h3>
                    <Table>
                        <TableHeader className="sticky top-0 bg-white z-10">
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
                                    <TableCell>{values[0] === "Loading..." ? <Skeleton className="h-4 w-full" /> : formatValue(values[0])}</TableCell>
                                    <TableCell>{values[1] === "Loading..." ? <Skeleton className="h-4 w-full" /> : formatValue(values[1])}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ))}
            <div className="flex justify-end mt-4">
                <Drawer open={isOpen} onOpenChange={setIsOpen}>
                    <DrawerTrigger asChild>
                        <Button variant="outline" size="icon">
                            <PlusIcon className="h-4 w-4" />
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className='flex flex-col items-center justify-center space-y-4'>
                        <DrawerHeader>
                            <div className='flex flex-row items-center'>
                                <SparklesIcon />
                                <DrawerTitle className='ml-3'>KPI Calculator</DrawerTitle>
                            </div>
                            <DrawerDescription>Enter details for the new KPI.</DrawerDescription>
                        </DrawerHeader>
                        <div className="flex space-x-2 mb-4">
                            {suggestions.map(suggestion => (
                                <Button key={suggestion} variant="secondary" onClick={() => handleSuggestionClick(suggestion)}>
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col space-y-4 w-full max-w-xs">
                            <Input value={form.watch("kpiName")} onChange={e => form.setValue("kpiName", e.target.value)} placeholder="Enter KPI name" />
                            <DrawerFooter className="flex justify-between">
                                <Button type="submit" disabled={isLoading}>Submit</Button>
                                <DrawerClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </form>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    );
};

export default ComparisonTable;
