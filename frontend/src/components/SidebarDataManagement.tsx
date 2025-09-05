import { useState } from 'react';
import { api } from '../lib/api';
import { useToast } from './ui/Toast';
import { Button } from './ui/button';
import { ConfirmationDialog } from './ui/confirmation-dialog';

export function SidebarDataManagement() {
  const { show } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearDialog, setClearDialog] = useState<{ isOpen: boolean }>({
    isOpen: false
  });

  const handleSeedData = async () => {
    if (isSeeding) return;
    
    setIsSeeding(true);
    try {
      const result = await api.admin.seed();
      show({ 
        type: "success", 
        message: `Test data seeded! ${result.data.customers} customers, ${result.data.products} products, ${result.data.orders} orders.` 
      });
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('dataChanged'));
    } catch (error) {
      show({ 
        type: "error", 
        message: error instanceof Error ? error.message : 'Failed to seed test data' 
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    if (isClearing) return;
    
    setIsClearing(true);
    try {
      await api.admin.clear();
      show({ 
        type: "success", 
        message: 'All data cleared!' 
      });
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('dataChanged'));
    } catch (error) {
      show({ 
        type: "error", 
        message: error instanceof Error ? error.message : 'Failed to clear data' 
      });
    } finally {
      setIsClearing(false);
    }
  };

  const openClearDialog = () => {
    setClearDialog({ isOpen: true });
  };

  const closeClearDialog = () => {
    setClearDialog({ isOpen: false });
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSeedData}
        disabled={isSeeding}
        size="sm"
        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
      >
        {isSeeding ? (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Seeding...</span>
          </div>
        ) : (
          '🌱 Seed Data'
        )}
      </Button>

      <Button
        onClick={openClearDialog}
        disabled={isClearing}
        size="sm"
        variant="destructive"
        className="w-full bg-red-600 hover:bg-red-700 text-white text-xs"
      >
        {isClearing ? (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Clearing...</span>
          </div>
        ) : (
          '🗑️ Clear Data'
        )}
      </Button>

      <ConfirmationDialog
        isOpen={clearDialog.isOpen}
        onClose={closeClearDialog}
        onConfirm={handleClearData}
        title="Clear All Data"
        message="Are you sure you want to delete ALL data? This action cannot be undone and will remove all customers, products, and orders."
        confirmText="Clear All Data"
        cancelText="Cancel"
        isLoading={isClearing}
      />
    </div>
  );
}
