import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'home',
        loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
        children: [
            {
                path: '',
                redirectTo: 'menu',
                pathMatch: 'full'
            },
            {
                path: 'menu',
                loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'inventory',
                loadComponent: () => import('./pages/inventory/inventory.component').then(m => m.InventoryComponent)
            },
            {
                path: 'cashier',
                loadComponent: () => import('./pages/cashier/cashier.component').then(m => m.CashierComponent)
            },
            {
                path: 'sales-report',
                loadComponent: () => import('./pages/sales-report/sales-report.component').then(m => m.SalesReportComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
            }
        ]
    }

];
