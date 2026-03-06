import { createContext, useContext, useState, useEffect } from 'react';
import { generateBudgetData, filterData, getAnomalies } from '../data/generator';
import { runFullAnalysis, getDepartmentLeaderboard } from '../services/analyticsEngine';
import { FISCAL_YEARS } from '../config/constants';

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        fiscalYear: FISCAL_YEARS[FISCAL_YEARS.length - 1], // Latest year
        quarter: null,
        division: null,
        department: null,
    });

    // Generate data on mount
    useEffect(() => {
        const data = generateBudgetData();
        setAllData(data);
        setLoading(false);
    }, []);

    // Re-filter and re-analyze when filters change
    useEffect(() => {
        if (allData.length === 0) return;

        const filtered = filterData(allData, filters);
        setFilteredData(filtered);

        const result = runFullAnalysis(filtered);
        setAnalysis(result);

        const lb = getDepartmentLeaderboard(filtered);
        setLeaderboard(lb);
    }, [allData, filters]);

    const updateFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({
            fiscalYear: FISCAL_YEARS[FISCAL_YEARS.length - 1],
            quarter: null,
            division: null,
            department: null,
        });
    };

    return (
        <FilterContext.Provider value={{
            allData,
            filteredData,
            analysis,
            leaderboard,
            filters,
            updateFilter,
            resetFilters,
            loading,
        }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilterContext() {
    const ctx = useContext(FilterContext);
    if (!ctx) throw new Error('useFilterContext must be used within FilterProvider');
    return ctx;
}
