import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Dashboard, DashboardLayout, WidgetConfig } from '../types/dashboard';
import { dashboardService } from '../services/dashboard';

interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  loading: boolean;
  error: string | null;
}

type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DASHBOARDS'; payload: Dashboard[] }
  | { type: 'SET_CURRENT_DASHBOARD'; payload: Dashboard | null }
  | { type: 'UPDATE_DASHBOARD'; payload: Dashboard }
  | { type: 'ADD_DASHBOARD'; payload: Dashboard }
  | { type: 'REMOVE_DASHBOARD'; payload: string };

const initialState: DashboardState = {
  dashboards: [],
  currentDashboard: null,
  loading: false,
  error: null,
};

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_DASHBOARDS':
      return { ...state, dashboards: action.payload };
    case 'SET_CURRENT_DASHBOARD':
      return { ...state, currentDashboard: action.payload };
    case 'UPDATE_DASHBOARD':
      return {
        ...state,
        dashboards: state.dashboards.map((d) =>
          d.id === action.payload.id ? action.payload : d
        ),
        currentDashboard:
          state.currentDashboard?.id === action.payload.id
            ? action.payload
            : state.currentDashboard,
      };
    case 'ADD_DASHBOARD':
      return {
        ...state,
        dashboards: [...state.dashboards, action.payload],
      };
    case 'REMOVE_DASHBOARD':
      return {
        ...state,
        dashboards: state.dashboards.filter((d) => d.id !== action.payload),
        currentDashboard:
          state.currentDashboard?.id === action.payload
            ? null
            : state.currentDashboard,
      };
    default:
      return state;
  }
};

interface DashboardContextType extends DashboardState {
  getDashboards: () => Promise<void>;
  getDashboard: (id: string) => Promise<void>;
  createDashboard: (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  updateLayout: (layout: DashboardLayout) => Promise<void>;
  addWidget: (widget: WidgetConfig) => Promise<void>;
  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => Promise<void>;
  removeWidget: (widgetId: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const getDashboards = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const dashboards = await dashboardService.getDashboards();
      dispatch({ type: 'SET_DASHBOARDS', payload: dashboards });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch dashboards' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const getDashboard = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const dashboard = await dashboardService.getDashboard(id);
      dispatch({ type: 'SET_CURRENT_DASHBOARD', payload: dashboard });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch dashboard' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createDashboard = useCallback(async (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newDashboard = await dashboardService.createDashboard(dashboard);
      dispatch({ type: 'ADD_DASHBOARD', payload: newDashboard });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create dashboard' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateDashboard = useCallback(async (id: string, updates: Partial<Dashboard>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedDashboard = await dashboardService.updateDashboard(id, updates);
      dispatch({ type: 'UPDATE_DASHBOARD', payload: updatedDashboard });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update dashboard' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteDashboard = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await dashboardService.deleteDashboard(id);
      dispatch({ type: 'REMOVE_DASHBOARD', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete dashboard' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateLayout = useCallback(async (layout: DashboardLayout) => {
    if (!state.currentDashboard) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedDashboard = await dashboardService.updateDashboard(state.currentDashboard.id, {
        layout,
      });
      dispatch({ type: 'UPDATE_DASHBOARD', payload: updatedDashboard });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update layout' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentDashboard]);

  const addWidget = useCallback(async (widget: WidgetConfig) => {
    if (!state.currentDashboard) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedLayout = {
        ...state.currentDashboard.layout,
        widgets: [...state.currentDashboard.layout.widgets, widget],
      };
      const updatedDashboard = await dashboardService.updateDashboard(state.currentDashboard.id, {
        layout: updatedLayout,
      });
      dispatch({ type: 'UPDATE_DASHBOARD', payload: updatedDashboard });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add widget' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentDashboard]);

  const updateWidget = useCallback(async (widgetId: string, updates: Partial<WidgetConfig>) => {
    if (!state.currentDashboard) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedLayout = {
        ...state.currentDashboard.layout,
        widgets: state.currentDashboard.layout.widgets.map((widget) =>
          widget.id === widgetId ? { ...widget, ...updates } : widget
        ),
      };
      const updatedDashboard = await dashboardService.updateDashboard(state.currentDashboard.id, {
        layout: updatedLayout,
      });
      dispatch({ type: 'UPDATE_DASHBOARD', payload: updatedDashboard });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update widget' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentDashboard]);

  const removeWidget = useCallback(async (widgetId: string) => {
    if (!state.currentDashboard) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedLayout = {
        ...state.currentDashboard.layout,
        widgets: state.currentDashboard.layout.widgets.filter((widget) => widget.id !== widgetId),
      };
      const updatedDashboard = await dashboardService.updateDashboard(state.currentDashboard.id, {
        layout: updatedLayout,
      });
      dispatch({ type: 'UPDATE_DASHBOARD', payload: updatedDashboard });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove widget' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentDashboard]);

  const value = {
    ...state,
    getDashboards,
    getDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    updateLayout,
    addWidget,
    updateWidget,
    removeWidget,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}; 