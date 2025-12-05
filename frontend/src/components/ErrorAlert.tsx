import { Card, CardContent } from '../components/ui/card';
import { Button } from './ui/button';
import { AlertCircle, X } from 'lucide-react';

export const ErrorAlert: React.FC<{ error: string | null; onDismiss: () => void }> = ({
  error,
  onDismiss,
}) => {
  if (!error) return null;

  return (
    <Card className="bg-red-900 border-red-700 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-200">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-red-400 hover:text-red-300 hover:bg-red-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};