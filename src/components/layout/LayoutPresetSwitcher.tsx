'use client';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type LayoutPreset = 'balanced' | 'agent-focused';

interface LayoutPresetSwitcherProps {
  currentPreset: LayoutPreset;
  onPresetChange: (preset: LayoutPreset) => void;
}

export function LayoutPresetSwitcher({ currentPreset, onPresetChange }: LayoutPresetSwitcherProps) {
  return (
    <Card variant="bordered" padding="sm" className="inline-flex gap-1">
      <Button
        onClick={() => onPresetChange('balanced')}
        variant={currentPreset === 'balanced' ? 'default' : 'ghost'}
        size="sm"
        className="text-xs"
      >
        Balanced
      </Button>
      <Button
        onClick={() => onPresetChange('agent-focused')}
        variant={currentPreset === 'agent-focused' ? 'default' : 'ghost'}
        size="sm"
        className="text-xs"
      >
        Agent-Focused
      </Button>
    </Card>
  );
}
