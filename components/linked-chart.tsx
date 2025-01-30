"use client";
import * as React from "react";
import { useState, useMemo, useRef } from "react"

import { format as formatDate, parse, addDays, addMonths, addYears, addQuarters } from "date-fns";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ChevronsUpDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { MoreHorizontal } from "lucide-react"

import {
  ColumnDef,
  ColumnFiltersState,
} from "@tanstack/react-table";


import { Area, Bar, CartesianGrid, XAxis, YAxis, ComposedChart, ReferenceArea, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"




export interface GroupedData {
    dateLabel: string;
    [key: string]: number | string;
}

const CHART_TYPES = {
  'area': { 
    value: 'area' as const, 
    label: 'Area',
    component: Area,
    config: {
      type: 'monotone' as const,
      fillOpacity: 0.2,
    }
  },
  'bar': { 
    value: 'bar' as const, 
    label: 'Bar',
    component: Bar,
    config: {
      type: 'monotone' as const,
      fillOpacity: 0.5,
    }
  },
} as const;

type ChartType = keyof typeof CHART_TYPES;

type AggregatorConfig<TData> = {
  [key: string]: (item: TData) => number;
};

const defaultAggregatorConfig = {
  transactionCount: () => 1,
} as const;

interface LinkedChartProps<TData extends object = object> {
  data: TData[];
  columns?: ColumnDef<TData, any>[];
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  dateField: keyof TData;
  dateFormat?: DateFormat;
  aggregatorConfig?: AggregatorConfig<TData>;
  chartType?: ChartType;
  title?: string;
}

type DateLabel = string;

const dateUtils = {
  parse: (label: DateLabel, format: string): Date | null => {
    try {
      return parse(label, format, new Date());
    } catch (error) {
      console.error(`Invalid date label: "${label}". Expected format: ${format}`);
      return null;
    }
  },
  
  format: (label: DateLabel, format: string): string => {
    const date = dateUtils.parse(label, format);
    return date ? formatDate(date, format) : label;
  },
  
  addInterval: (date: Date, format: string): Date => {
    switch (format) {
      case 'dd MMM yyyy': return addDays(date, 1);
      case 'MMM yyyy': return addMonths(date, 1);
      case 'QQQ yyyy': return addQuarters(date, 1);
      case 'yyyy': return addYears(date, 1);
      default: return addDays(date, 1);
    }
  },
  
  toTimestamp: (label: DateLabel, format: string, isEndDate: boolean = false): number | null => {
    const date = dateUtils.parse(label, format);
    if (!date) return null;
    
    return Math.floor((isEndDate ? dateUtils.addInterval(date, format) : date).getTime() / 1000);
  }
};

const chartUtils = {
  formatLabel: (key: string): string => 
    key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    
   getColor: (index: number): string => 
    `hsl(var(--chart-${(index+1)}))`,
  
    
  generateConfig: (aggregatorConfig: Record<string, any>): ChartConfig => 
    Object.keys(aggregatorConfig).reduce((acc, key, index) => ({
      ...acc,
      [key]: {
        label: chartUtils.formatLabel(key),
        color: chartUtils.getColor(index),
      }
    }), {} as ChartConfig)
};

const groupDataByDate = <TData,>(
  items: TData[],
  format: string,
  dateField: keyof TData,
  aggregator: Record<string, (item: TData) => number>
): GroupedData[] => {
  const grouped = items.reduce(
    (acc, item) => {
      const dateValue = item[dateField] as number;
      const formattedDate = formatDate(new Date(dateValue * 1000), format);
      
      return {
        ...acc,
        [formattedDate]: {
          dateLabel: formattedDate,
          ...Object.fromEntries(
            Object.entries(aggregator).map(([key, fn]) => [
              key,
              ((acc[formattedDate]?.[key] as number) || 0) + fn(item)
            ])
          )
        }
      };
    },
    {} as Record<string, GroupedData>
  );

  return Object.values(grouped).sort((a, b) => 
    dateUtils.parse(a.dateLabel, format)!.getTime() - 
    dateUtils.parse(b.dateLabel, format)!.getTime()
  );
};

const DATE_FORMATS = [
  { value: 'MMM yyyy', label: 'Month (May 2024)' },
  { value: 'QQQ yyyy', label: 'Quarter (Q2 2024)' },
  { value: 'yyyy', label: 'Year (2024)' },
  { value: 'MM/dd/yyyy', label: 'US Date (12/31/2024)' },
  { value: 'dd/MM/yyyy', label: 'EU Date (31/12/2024)' },
  { value: 'yyyy-MM-dd', label: 'ISO Date (2024-12-31)' },
] as const;

type DateFormat = typeof DATE_FORMATS[number]['value'];

function DateFormatSelector({ 
  onFormatChange, 
  selectedFormat, 
  ...props 
}: { onFormatChange: (format: DateFormat) => void; selectedFormat: DateFormat }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen} {...props}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            <span className="truncate">
              {DATE_FORMATS.find(f => f.value === selectedFormat)?.label || selectedFormat}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search date formats..." />
            <CommandList>
              <CommandEmpty>No format found.</CommandEmpty>
              <CommandGroup>
                {DATE_FORMATS.map((format) => (
                  <CommandItem
                    key={format.value}
                    value={format.value}
                    onSelect={(currentValue) => {
                      onFormatChange(currentValue as DateFormat);
                      setOpen(false);
                    }}
                  >
                    {format.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}



const isValidDateField = <TData,>(columns: ColumnDef<TData,any>[], dateField: string) => {
  const DATE_FILTER_EXAMPLE = `filterFn: (row, columnId, filterValue) => {
        const cellValue = row.getValue<number>(columnId);
        if (!filterValue?.start || !filterValue?.end) return true;
        return cellValue >= filterValue.start && cellValue <= filterValue.end;
      }`;

  const dateColumn = columns.find(col => 
    (col as { accessorKey: string }).accessorKey === dateField
  );

  if (!dateColumn?.filterFn) {
    throw new Error(`Column ${dateField} must have a filterFn. Example:\n${DATE_FILTER_EXAMPLE}`);
  }
  
  const fnString = dateColumn.filterFn.toString();

  if (!fnString.includes('start') || !fnString.includes('end')) {
    throw new Error(`Column ${dateField} has incorrect filterFn.\nExpected:\n${DATE_FILTER_EXAMPLE}`);
  }
  
  return dateField as keyof TData;
};

function isValidChartType(type: string): type is ChartType {
  if (!Object.keys(CHART_TYPES).some(t => t === type)) {
    throw new Error(`Invalid chart type: ${type}. Must be one of: ${Object.keys(CHART_TYPES).join(', ')}`);
  }
  return true;
}

function isValidDateFormat(format: string): format is DateFormat {
  if (!DATE_FORMATS.some(f => f.value === format)) {
    throw new Error(`Invalid date format: ${format}. Must be one of: ${DATE_FORMATS.map(f => f.value).join(', ')}`);
  }
  return true;
}

function isValidDataField<T extends object>(data: T[], field: keyof T): boolean {
  return data.length > 0 && field in data[0];
}

function useChartInteraction<TData>({ 
  dateField,
  selectedFormat,
  setColumnFilters,
}: {
  dateField: string;
  selectedFormat: string;
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
}) {
  const [timeRange, setTimeRange] = useState<{ start: number; end: number } | null>(null);
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [initialX, setInitialX] = useState<number | null>(null);

  const handleSelection = (start: number, end: number) => {
    if (setColumnFilters) {
      setColumnFilters(prev => {
        const updatedFilters = [...prev, { id: dateField, value: { start, end } }];
        return Array.from(new Map(updatedFilters.map(filter => [filter.id, filter])).values());
      });
    } else {
      setTimeRange({ start, end });
    }
  };

  const handleMouseDown = (e: any) => {
    if (e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
      setRefAreaRight(e.activeLabel);
      setInitialX(e.chartX);
      setIsSelecting(true);
    }
  };

  const handleMouseMove = (e: any) => {
    if (isSelecting && e.activeLabel && initialX !== null) {
      // Moving right
      if (e.chartX > initialX) {
        setRefAreaRight(e.activeLabel);
      }
      // Moving left
      else {
        setRefAreaLeft(e.activeLabel);
      }
    }
  };

  const handleMouseUp = () => {
    if (refAreaLeft && refAreaRight) {
      const leftTs = dateUtils.toTimestamp(refAreaLeft, selectedFormat);
      const rightTs = dateUtils.toTimestamp(refAreaRight, selectedFormat, true);
      
      if (leftTs && rightTs) {
        const start = Math.min(leftTs, rightTs);
        const end = Math.max(leftTs, rightTs);
        
        handleSelection(start, end);
      }
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
    setInitialX(null);
  };

  const handleReset = () => {
    if (setColumnFilters) {
      setColumnFilters(prev => prev.filter(filter => filter.id !== dateField));
    } else {
      setTimeRange(null);
    }
  };

  return {
    timeRange,
    refAreaLeft,
    refAreaRight,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleReset,
  };
}

export function LinkedChart<TData extends object>({ 
  data,
  columns,
  setColumnFilters,
  dateField,
  dateFormat = 'MMM yyyy',
  chartType = 'area',
  title = 'Chart',
  aggregatorConfig = defaultAggregatorConfig,
}: LinkedChartProps<TData>) {
  const [selectedFormat, setSelectedFormat] = useState<DateFormat>(dateFormat);
  const [selectedChartType, setSelectedChartType] = useState<ChartType>(chartType);

  const {
    timeRange,
    refAreaLeft,
    refAreaRight,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleReset,
  } = useChartInteraction({
    dateField: dateField as string,
    selectedFormat,
    setColumnFilters,
  });

  // Validations
  if (!isValidDataField<TData>(data, dateField)) {
    throw new Error('Invalid date field');
  }
  if (columns && !isValidDateField(columns, dateField as string)) throw new Error('Invalid date field configuration');
  if (!isValidDateFormat(dateFormat)) throw new Error('Invalid date format');
  if (!isValidChartType(chartType)) throw new Error('Invalid chart type');

  // Filter data based on mode (external vs internal filtering)
  const filteredData = useMemo(() => {
    if (setColumnFilters || !timeRange) return data;
    
    return data.filter(item => {
      const timestamp = item[dateField] as number;
      return timestamp >= timeRange.start && timestamp <= timeRange.end;
    });
  }, [data, dateField, timeRange, setColumnFilters]);

  const groupedData = useMemo(() => 
    groupDataByDate(filteredData, selectedFormat, dateField, aggregatorConfig),
    [filteredData, selectedFormat, dateField, aggregatorConfig]
  );

  // Find the selected chart configuration
  const selectedChartConfig = useMemo(() => 
    CHART_TYPES[selectedChartType],
    [selectedChartType]
  );

  const chartRef = useRef<HTMLDivElement>(null);

  return (
      <Card className="w-full h-full">
          <CardHeader className="flex-col items-stretch space-y-0 border-b p-0 sm:flex-row hidden sm:flex">
              <div className="flex justify-between items-center w-full px-6 py-5 sm:py-6">
                  <div className="flex-1">
                      <CardTitle>{title}</CardTitle>
                  </div>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <div className="grid gap-3 p-3">
                            <span className="text-sm font-medium leading-none">
                              Chart Type
                            </span>
                            <Tabs 
                              value={selectedChartType}
                              onValueChange={(value: string) => {
                                if (value in CHART_TYPES) {
                                  setSelectedChartType(value as ChartType)
                                }
                              }}
                              className="w-[200px]"
                            >
                              <TabsList className="grid w-full grid-cols-2">
                                {Object.keys(CHART_TYPES).map(type => (
                                  <TabsTrigger key={type} value={type}>
                                    {CHART_TYPES[type as ChartType].label}
                                  </TabsTrigger>
                                ))}
                              </TabsList>
                            </Tabs>
                          </div>
                          <DropdownMenuSeparator />
                          <div className="grid gap-3 p-3">
                            <span className="text-sm font-medium leading-none">
                              Date Format
                            </span>
                            <DateFormatSelector
                              selectedFormat={selectedFormat}
                              onFormatChange={setSelectedFormat}
                            />
                          </div>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6 h-full sm:h-[calc(100%-150px)]">
              <ChartContainer
                  config={chartUtils.generateConfig(aggregatorConfig)}
                  className="w-full h-full"
              >
                  <div className="h-full" ref={chartRef} style={{ touchAction: 'none' }}>
                      <div className="flex justify-end my-2 sm:mb-4">
                        <Button variant="outline" onClick={handleReset} className="text-xs sm:text-sm">
                              Reset
                          </Button>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                              data={groupedData}
                              margin={{
                                  top: 10,
                                  right: 10,
                                  left: 0,
                                  bottom: 0,
                              }}
                              onMouseDown={handleMouseDown}
                              onMouseMove={handleMouseMove}
                              onMouseUp={handleMouseUp}
                              onMouseLeave={handleMouseUp}
                          >
                              <defs>
                                  {Object.keys(aggregatorConfig).map((key, index) => {
                                      const color = chartUtils.getColor(index);

                                      return (
                                          <linearGradient 
                                              key={key} 
                                              id={`gradient-${index}`}
                                              x1="0" 
                                              y1="0" 
                                              x2="0" 
                                              y2="1"
                                          >
                                              <stop 
                                                  offset="5%" 
                                                  stopColor={color} 
                                                  stopOpacity={0.8} 
                                              />
                                              <stop 
                                                  offset="95%" 
                                                  stopColor={color} 
                                                  stopOpacity={0.1} 
                                              />
                                          </linearGradient>
                                      );
                                  })}
                              </defs>
                              <CartesianGrid vertical={false} />
                              <XAxis
                                  dataKey="dateLabel"
                                  tickFormatter={(label) => dateUtils.format(label, selectedFormat)}
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={4}
                                  minTickGap={16}
                                  style={{ fontSize: '10px', userSelect: 'none' }}
                              />
                              <YAxis
                                  tickLine={false}
                                  axisLine={false}
                                  style={{ fontSize: '10px', userSelect: 'none' }}
                                  width={50}
                              />
                              <ChartTooltip
                                  cursor={false}
                                  content={
                                      <ChartTooltipContent
                                          className="w-[150px] sm:w-[200px] font-mono text-xs sm:text-sm"
                                          nameKey=""
                                          labelFormatter={(value) => dateUtils.format(value, selectedFormat)}
                                      />
                                  }
                              />
                              <ChartLegend content={<ChartLegendContent />} />
                              {Object.keys(aggregatorConfig).map((key, index) => {
                                  const ChartComponent = selectedChartConfig.component;
                                  return (
                                      <ChartComponent
                                          key={key}
                                          dataKey={key}
                                          stroke={chartUtils.getColor(index)}
                                          fill={`url(#gradient-${index})`}
                                          {...selectedChartConfig.config}
                                      />
                                  );
                              })}
                              {refAreaLeft && refAreaRight && (
                                    <ReferenceArea
                                        x1={refAreaLeft}
                                        x2={refAreaRight}
                                        strokeOpacity={0.3}
                                        fill="hsl(var(--foreground))"
                                        fillOpacity={0.05}
                                    />
                                )}
                          </ComposedChart>
                      </ResponsiveContainer>
                  </div>
              </ChartContainer>
          </CardContent>
      </Card>
  );
}


// TODO: Add zoom functionality

