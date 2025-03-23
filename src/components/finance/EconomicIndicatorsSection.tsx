
import { EconomicIndicator } from "@/services/economic/EconomicIndicatorService";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface EconomicIndicatorsSectionProps {
  economicIndicators: EconomicIndicator[] | null;
  loading: boolean;
  isVisible: boolean;
}

export const EconomicIndicatorsSection = ({ economicIndicators, loading, isVisible }: EconomicIndicatorsSectionProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Economic Indicators
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Key economic metrics and performance indicators for Zambia
      </p>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(7).fill(0).map((_, i) => (
            <Card key={`indicator-skeleton-${i}`} className="p-6">
              <Skeleton className="h-6 w-36 mb-4" />
              <Skeleton className="h-10 w-28 mb-3" />
              <Skeleton className="h-5 w-24 mb-4" />
              <Skeleton className="h-4 w-48" />
            </Card>
          ))}
        </div>
      ) : economicIndicators ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {economicIndicators.map((indicator, index) => (
            <Card 
              key={indicator.name}
              className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg"
              style={{ 
                opacity: 0,
                animation: isVisible ? `fade-in 0.5s ease-out ${index * 0.08}s forwards` : "none"
              }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {indicator.name}
              </h3>
              <div className="flex items-center mb-2">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {indicator.value}
                </div>
                <div className={`flex items-center ml-3 ${indicator.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {indicator.isPositive ? 
                    <ArrowUpRight className="h-4 w-4 mr-1" /> : 
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  }
                  <span>{indicator.change}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {indicator.description}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                <span>Source: {indicator.source}</span>
                <span>Updated: {indicator.lastUpdated}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">
            No economic indicator data available
          </p>
        </div>
      )}
    </div>
  );
};

export default EconomicIndicatorsSection;
