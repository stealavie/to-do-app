import { createContext } from 'react';
import type { NotificationContext as INotificationContext } from '../types';

export const NotificationContext = createContext<INotificationContext | undefined>(undefined);
