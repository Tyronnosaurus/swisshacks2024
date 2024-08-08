"use client";
import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { PlusIcon, SparklesIcon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Skeleton } from "@/components/ui/skeleton";

const suggestions = ["Cash Ratio", "ROE", "Net Income Margin"];

// Define the validation schema using Zod
const kpiSchema = z.object({
    kpiName: z.string().nonempty("KPI name is required"),
});

// Define the type for the form data based on the Zod schema
type KpiFormData = z.infer<typeof kpiSchema>;

// Define the props type for the ComparisonTable component
interface ComparisonTableProps {
    file1: string;
    file2: string;
}

// Define the ComparisonTable functional component with props
const ComparisonTable: React.FC<ComparisonTableProps> = ({ file1, file2 }) => {
    const [selectedSuggestion, setSelectedSuggestion] = useState(""); // State to track selected KPI suggestion
    const [isOpen, setIsOpen] = useState(false); // State to manage drawer visibility
    const [loadingKpi, setLoadingKpi] = useState<string | null>(null); // State to track loading state for KPI

    // React Hook Form setup for managing form state and validation
    const form = useForm<KpiFormData>({
        resolver: zodResolver(kpiSchema),
        defaultValues: {
            kpiName: "",
        },
    });

    // Function to send a request to the server to calculate the KPI
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

    // useMutation hook to handle the API call and state updates
    const { mutate: calculateKpiMutation, isLoading } = useMutation(calculateKpi, {
        onMutate: ({ kpiName }) => {
            setIsOpen(false);
            setLoadingKpi(kpiName); // Set loading state for the KPI being calculated
        },
        onSuccess: (data) => {
            setLoadingKpi(null); // Clear loading state once the KPI is successfully calculated
        },
        onError: (error: any) => {
            console.error(error.message);
            setLoadingKpi(null); // Clear loading state on error
        }
    });

    // Handle KPI suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        setSelectedSuggestion(suggestion);
        form.setValue("kpiName", suggestion); // Set the selected suggestion as the form input value
    };

    // Handle form submission to trigger KPI calculation
    const handleFormSubmit: SubmitHandler<KpiFormData> = (data) => {
        calculateKpiMutation({ fileid1: file1, fileid2: file2, kpiName: data.kpiName });
    };

    // JSX for rendering the component UI
    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Company Comparison</h2>

            {/* Section for "Basics" KPIs */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2 capitalize">Basics</h3>
                <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                            <TableHead>KPI</TableHead>
                            <TableHead>UBS</TableHead>
                            <TableHead>Siemens</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Legal structure</TableCell>
                            <TableCell>Swiss Ltd.</TableCell>
                            <TableCell>German Ltd.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Stock currency</TableCell>
                            <TableCell>USD</TableCell>
                            <TableCell>USD</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Volatility 1 year (in EUR)</TableCell>
                            <TableCell>11.57%</TableCell>
                            <TableCell>9.91%</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Section for "Profitability" KPIs */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2 capitalize">Profitability</h3>
                <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                            <TableHead>KPI</TableHead>
                            <TableHead>UBS</TableHead>
                            <TableHead>Siemens</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Net Income</TableCell>
                            <TableCell>5000</TableCell>
                            <TableCell>4800</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Return on Assets (ROA)</TableCell>
                            <TableCell>5.5%</TableCell>
                            <TableCell>5.2%</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Return on Equity (ROE)</TableCell>
                            <TableCell>12.5%</TableCell>
                            <TableCell>12.0%</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Section for "Growth" KPIs */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2 capitalize">Growth</h3>
                <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                            <TableHead>KPI</TableHead>
                            <TableHead>UBS</TableHead>
                            <TableHead>Siemens</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Revenue Growth</TableCell>
                            <TableCell>8%</TableCell>
                            <TableCell>7.5%</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Net Income Growth</TableCell>
                            <TableCell>10%</TableCell>
                            <TableCell>9%</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>EPS Growth</TableCell>
                            <TableCell>6%</TableCell>
                            <TableCell>5.8%</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Section for "Solvency" KPIs */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2 capitalize">Solvency</h3>
                <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                            <TableHead>KPI</TableHead>
                            <TableHead>UBS</TableHead>
                            <TableHead>Siemens</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Current Ratio</TableCell>
                            <TableCell>1.5</TableCell>
                            <TableCell>1.6</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Quick Ratio</TableCell>
                            <TableCell>1.2</TableCell>
                            <TableCell>1.3</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Debt to Equity Ratio</TableCell>
                            <TableCell>0.8</TableCell>
                            <TableCell>0.75</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Button and Drawer for adding a new KPI */}
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
