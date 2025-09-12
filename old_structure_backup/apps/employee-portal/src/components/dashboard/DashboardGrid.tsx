import React, { useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboard } from '../../contexts/DashboardContext';
import { Dashboard as DashboardType, WidgetConfig } from '../../types/dashboard';
import { ChartWidget } from './widgets/ChartWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  dashboard: DashboardType;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ dashboard }) => {
  const { updateLayout } = useDashboard();

  const handleLayoutChange = useCallback(
    (layout: any) => {
      const updatedLayout = {
        ...dashboard.layout,
        widgets: dashboard.layout.widgets.map((widget) => {
          const layoutItem = layout.find((item: any) => item.i === widget.id);
          if (layoutItem) {
            return {
              ...widget,
              position: {
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h,
              },
            };
          }
          return widget;
        }),
      };
      updateLayout(updatedLayout);
    },
    [dashboard.layout, updateLayout]
  );

  const renderWidget = (widget: WidgetConfig) => {
    switch (widget.type) {
      case 'chart':
        return <ChartWidget config={widget.config} />;
      // Add more widget types here
      default:
        return null;
    }
  };

  const layouts = {
    lg: dashboard.layout.widgets.map((widget) => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      minW: 2,
      minH: 2,
    })),
  };

  return (
    <div className="p-4">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={dashboard.layout.grid.rowHeight}
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
        margin={[16, 16]}
      >
        {dashboard.layout.widgets.map((widget) => (
          <div key={widget.id} className="bg-white p-4 shadow-sm">
            {renderWidget(widget)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}; 