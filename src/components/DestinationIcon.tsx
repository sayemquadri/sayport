import {
  Feather,
  FlaskConical,
  Layers,
  Send,
  Sparkles,
} from 'lucide-react';
import type { DestinationId } from '../data/portfolio';

interface DestinationIconProps {
  id: DestinationId;
  className?: string;
}

export function DestinationIcon({ id, className = 'h-3.5 w-3.5' }: DestinationIconProps) {
  switch (id) {
    case 'work':
      return <Layers className={className} aria-hidden="true" />;
    case 'creative':
      return <Feather className={className} aria-hidden="true" />;
    case 'experiments':
      return <FlaskConical className={className} aria-hidden="true" />;
    case 'about':
      return <Sparkles className={className} aria-hidden="true" />;
    case 'contact':
      return <Send className={className} aria-hidden="true" />;
  }
}
