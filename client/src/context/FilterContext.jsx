import { createContext, useContext, useState, useEffect } from 'react';
import { fetchAllData } from '../services/firebaseService';
import { filterData, getAnomalies } from '../data/generator';
import { runFullAnalysis, getDepartmentLeaderboard } from '../services/analyticsEngine';
import { FISCAL_YEARS } from '../config/constants';

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataSource, setDataSource] = useState('loading');
    const [meta, setMeta] = useState(null);

    const [filters, setFilters] = useState({
        fiscalYear: null, // Will be set after data loads
        quarter: null,
        division: null,
        department: null,
    });

    // Fetch Firebase data on mount
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);
                const result = await fetchAllData();

                if (result.records.length === 0) {
                    setError('No data found in Firebase. Please check your Firestore collections.');
                    setDataSource('empty');
                    setLoading(false);
                    return;
                }

                setAllData(result.records);
                setMeta(result.meta);
                setDataSource('firebase');

                // Set default filter to the latest fiscal year in the data
                const availableYears = result.meta.fiscalYears;
                if (availableYears.length > 0) {
                    setFilters((prev) => ({
                        ...prev,
                        fiscalYear: availableYears[availableYears.length - 1],
                    }));
                }

                setLoading(false);
            } catch (err) {
                console.error('[FilterContext] Firebase fetch error:', err);
                setError(`Firebase error: ${err.message}`);
                setDataSource('error');
                setLoading(false);
            }
        }

        loadData();
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
        const availableYears = meta?.fiscalYears || FISCAL_YEARS;
        setFilters({
            fiscalYear: availableYears[availableYears.length - 1],
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
            error,
            dataSource,
            meta,
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

