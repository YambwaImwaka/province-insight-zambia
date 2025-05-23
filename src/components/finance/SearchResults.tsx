
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, ChevronRight, Bookmark, BookmarkPlus } from 'lucide-react';
import { addToWatchlist } from '@/services/watchlist/WatchlistService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ExchangeRateData } from '@/services/FinanceService';
import { CommodityPrice } from '@/services/FinanceService';
import { EconomicIndicator } from '@/services/FinanceService';
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchResultsProps {
  query: string;
  exchangeRates?: ExchangeRateData;
  commodities?: CommodityPrice[];
  indicators?: EconomicIndicator[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  query, 
  exchangeRates,
  commodities,
  indicators 
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Mutation to add to watchlist
  const addMutation = useMutation({
    mutationFn: addToWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Added to your watchlist');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add to watchlist');
    }
  });
  
  // Search in exchange rates
  const matchingCurrencies = exchangeRates?.rates
    ? Object.entries(exchangeRates.rates)
        .filter(([currency]) => 
          currency.toLowerCase().includes(query.toLowerCase())
        )
        .map(([currency, rate]) => ({
          id: currency,
          name: currency,
          value: rate,
          type: 'currency' as const
        }))
    : [];
  
  // Search in commodities
  const matchingCommodities = commodities
    ? commodities
        .filter(commodity => 
          commodity.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(commodity => ({
          id: commodity.name,
          name: commodity.name,
          value: `${commodity.price} ${commodity.unit}`,
          change: commodity.change,
          isPositive: commodity.isPositive,
          type: 'commodity' as const
        }))
    : [];
  
  // Search in indicators
  const matchingIndicators = indicators
    ? indicators
        .filter(indicator => 
          indicator.name.toLowerCase().includes(query.toLowerCase()) ||
          indicator.description.toLowerCase().includes(query.toLowerCase())
        )
        .map(indicator => ({
          id: indicator.name.replace(/\s+/g, ''),
          name: indicator.name,
          value: indicator.value,
          change: indicator.change,
          isPositive: indicator.isPositive,
          description: indicator.description,
          source: indicator.source,
          type: 'indicator' as const
        }))
    : [];
  
  // Combine all results
  const allResults = [
    ...matchingCurrencies,
    ...matchingCommodities,
    ...matchingIndicators
  ];
  
  const handleAddToWatchlist = (item: any) => {
    if (!user) {
      toast.error('Please sign in to add items to your watchlist');
      return;
    }
    
    addMutation.mutate({
      id: item.id,
      name: item.name,
      type: item.type,
      value: item.value
    });
  };
  
  if (allResults.length === 0) {
    return (
      <Card>
        <CardContent className="py-4 sm:py-6 text-center">
          <p className="text-muted-foreground">No results found for "{query}"</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Try using different keywords or check our finance categories
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Get grid column configuration based on screen size
  const getGridCols = () => {
    if (isMobile) return "grid-cols-1";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">Search Results</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Found {allResults.length} results for "{query}"
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="space-y-4">
            {matchingCurrencies.length > 0 && (
              <div>
                <h3 className="font-medium text-sm sm:text-base mb-2">Currencies</h3>
                <div className={`grid ${getGridCols()} gap-2 sm:gap-4`}>
                  {matchingCurrencies.map(currency => (
                    <div key={currency.id} className="border rounded-md p-2 sm:p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm sm:text-base">{currency.name}</div>
                        <div className="text-xs sm:text-sm">{currency.value} ZMW</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAddToWatchlist(currency)}
                        disabled={addMutation.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {matchingCommodities.length > 0 && (
              <div>
                <h3 className="font-medium text-sm sm:text-base mb-2">Commodities</h3>
                <div className={`grid ${getGridCols()} gap-2 sm:gap-4`}>
                  {matchingCommodities.map(commodity => (
                    <div key={commodity.id} className="border rounded-md p-2 sm:p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm sm:text-base">{commodity.name}</div>
                        <div className="text-xs sm:text-sm">
                          {commodity.value} 
                          {commodity.change && (
                            <span className={commodity.isPositive ? 'text-green-600' : 'text-red-600'}>
                              {' '}({commodity.change})
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAddToWatchlist(commodity)}
                        disabled={addMutation.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {matchingIndicators.length > 0 && (
              <div>
                <h3 className="font-medium text-sm sm:text-base mb-2">Economic Indicators</h3>
                {matchingIndicators.map(indicator => (
                  <div key={indicator.id} className="border rounded-md p-2 sm:p-3 mb-2 sm:mb-3 last:mb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm sm:text-base">{indicator.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg font-semibold">{indicator.value}</span>
                          {indicator.change && (
                            <span className={`text-xs sm:text-sm ${indicator.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {indicator.change}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAddToWatchlist(indicator)}
                        disabled={addMutation.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    </div>
                    {indicator.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">{indicator.description}</p>
                    )}
                    {indicator.source && (
                      <div className="text-xs text-muted-foreground mt-1 sm:mt-2">
                        Source: {indicator.source}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchResults;
