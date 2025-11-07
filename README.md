# Point of Sale (POS) System - Next.js Customization

This project is a **customized Point of Sale (POS) system** built on top of the [TailAdmin Next.js Free Template](https://tailadmin.com) for office/business use. It extends the original template with specialized features for retail and sales operations.

> **Credits**: This project is based on the [TailAdmin - Free Next.js Tailwind Admin Dashboard Template](https://github.com/TailAdmin/free-nextjs-admin-dashboard) by [TailAdmin](https://tailadmin.com), released under the MIT License. All credit for the original template design and components goes to the TailAdmin team.

![TailAdmin - Next.js Dashboard Preview](./banner.png)

## About This Customization

This fork extends the original TailAdmin template with a **comprehensive Point of Sale (POS) system** designed for retail operations. Built on the solid foundation of **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS V4**, this customization adds domain-specific features while maintaining the quality and structure of the original template.

## Overview

This customized version retains all the powerful features of TailAdmin while adding specialized Point of Sale functionality including:

**Original TailAdmin Features:**

- Essential UI components and layouts for admin dashboards
- Server-side rendering (SSR), static site generation (SSG), and API route integration
- Comprehensive component library and data visualization

**Custom POS Features (Added in This Version):**

- 🛍️ **Product Management** - Browse and add products with categories and pricing
- 🛒 **Shopping Cart** - Add/remove items with quantity management
- 💳 **Payment Processing** - Support for multiple payment methods (Cash, QR Code, Card)
- 👥 **Customer Management** - Tier-based customer selection (ทั่วไป, Silver, Gold, Platinum, Diamond)
- 🏷️ **Discount Management** - Apply discounts via scanning or manual code entry
- 👔 **Staff Management** - Manager/Seller switching with reference ID tracking
- 🧾 **Receipt Generation** - Print receipts with transaction details
- 🌙 **Dark Mode Support** - Full dark mode throughout the application
- 🇹🇭 **Thai Language** - Complete Thai language localization

### Built With

- Next.js 15.x
- React 19
- TypeScript
- Tailwind CSS V4

### Quick Links

**Original Template (TailAdmin):**

- [✨ Visit Website](https://tailadmin.com)
- [📄 Documentation](https://tailadmin.com/docs)
- [⬇️ Download](https://tailadmin.com/download)
- [🖌️ Figma Design File (Community Edition)](https://www.figma.com/community/file/1463141366275764364)
- [⚡ Get PRO Version](https://tailadmin.com/pricing)
- [📦 GitHub Repository](https://github.com/TailAdmin/free-nextjs-admin-dashboard)

**This Project:**

- 🚀 POS System Implementation
- 📖 [Installation Guide](#installation) - Setup instructions below

### Original Template Versions

For the original TailAdmin template, visit:

- [Free Version](https://nextjs-free-demo.tailadmin.com)
- [Pro Version](https://nextjs-demo.tailadmin.com)

## Installation

### Prerequisites

To get started with TailAdmin, ensure you have the following prerequisites installed and set up:

- Node.js 18.x or later (recommended to use Node.js 20.x or later)

### Cloning the Repository

Clone the repository using the following command:

```bash
git clone https://github.com/TailAdmin/free-nextjs-admin-dashboard.git
```

> Windows Users: place the repository near the root of your drive if you face issues while cloning.

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

   > Use `--legacy-peer-deps` flag if you face peer-dependency error during installation.

2. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Components

### TailAdmin Base Components

This project inherits all the sophisticated components from TailAdmin:

- Sidebar and Navigation
- Data visualization components
- Profile management
- Tables and Charts (Line and Bar)
- Authentication forms and input elements
- Alerts, Dropdowns, Modals, Buttons and more
- Dark Mode 🕶️

### Custom POS Components Added

- **Product Selection Modal** - Browse and select products with pagination
- **Quantity Input Modal** - Specify quantity when adding items (with quick +1 button)
- **Product Table** - Accordion-based product list with expand/collapse
- **Payment Method Selector** - Multiple payment options with visual indicators
- **Payment Confirmation Screens** - Different UIs for Cash/QR/Card payments
- **Customer Level Selection** - Beautiful modal for tier-based customer selection
- **Receipt Generation** - Print-ready receipt formatting
- **Discount Manager** - Scan or input discount codes

All components are built with React and styled using Tailwind CSS for easy customization.

## Project Features

### This POS Customization Includes:

✅ Complete product catalog with categories and pricing
✅ Shopping cart with add/remove/quantity management
✅ Multiple payment methods (Cash, QR Code, Card)
✅ Customer tier-based pricing and selection
✅ Discount management system
✅ Staff/Manager switching with tracking
✅ Receipt printing functionality
✅ Full Thai language support
✅ Dark mode support throughout
✅ Responsive design for desktop and mobile
✅ Mock data integration for testing

### Original TailAdmin Features (Retained):

✅ 30+ dashboard components
✅ 50+ UI elements
✅ Comprehensive Figma design reference
✅ Server-side rendering capabilities
✅ Static site generation support
✅ Seamless API route integration

For more information about the original TailAdmin features and versions, visit [tailadmin.com](https://tailadmin.com/pricing).

## Changelog

### Version 2.0.2 - [March 25, 2025]

- Upgraded to Next v15.2.3 for [CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927) concerns
- Included overrides vectormap for packages to prevent peer dependency errors during installation.
- Migrated from react-flatpickr to flatpickr package for React 19 support

### Version 2.0.1 - [February 27, 2025]

#### Update Overview

- Upgraded to Tailwind CSS v4 for better performance and efficiency.
- Updated class usage to match the latest syntax and features.
- Replaced deprecated class and optimized styles.

#### Next Steps

- Run npm install or yarn install to update dependencies.
- Check for any style changes or compatibility issues.
- Refer to the Tailwind CSS v4 [Migration Guide](https://tailwindcss.com/docs/upgrade-guide) on this release. if needed.
- This update keeps the project up to date with the latest Tailwind improvements. 🚀

### v2.0.0 (February 2025)

A major update focused on Next.js 15 implementation and comprehensive redesign.

#### Major Improvements

- Complete redesign using Next.js 15 App Router and React Server Components
- Enhanced user interface with Next.js-optimized components
- Improved responsiveness and accessibility
- New features including collapsible sidebar, chat screens, and calendar
- Redesigned authentication using Next.js App Router and server actions
- Updated data visualization using ApexCharts for React

#### Breaking Changes

- Migrated from Next.js 14 to Next.js 15
- Chart components now use ApexCharts for React
- Authentication flow updated to use Server Actions and middleware

[Read more](https://tailadmin.com/docs/update-logs/nextjs) on this release.

#### Breaking Changes

- Migrated from Next.js 14 to Next.js 15
- Chart components now use ApexCharts for React
- Authentication flow updated to use Server Actions and middleware

### v1.3.4 (July 01, 2024)

- Fixed JSvectormap rendering issues

### v1.3.3 (June 20, 2024)

- Fixed build error related to Loader component

### v1.3.2 (June 19, 2024)

- Added ClickOutside component for dropdown menus
- Refactored sidebar components
- Updated Jsvectormap package

### v1.3.1 (Feb 12, 2024)

- Fixed layout naming consistency
- Updated styles

### v1.3.0 (Feb 05, 2024)

- Upgraded to Next.js 14
- Added Flatpickr integration
- Improved form elements
- Enhanced multiselect functionality
- Added default layout component

## License

This project is released under the **MIT License**, consistent with the original [TailAdmin template](https://github.com/TailAdmin/free-nextjs-admin-dashboard).

**Important:** This is a derivative work based on TailAdmin. When using or distributing this project, please:

1. Retain the original MIT License
2. Credit the original [TailAdmin project](https://tailadmin.com) and its creators
3. Include a note that this is a customized version for Point of Sale operations

**Original Template License:** MIT License - [TailAdmin Project](https://github.com/TailAdmin/free-nextjs-admin-dashboard)

### Original TailAdmin Support

If you find the original TailAdmin template helpful, consider supporting the creators:

- ⭐ [Star the original repository](https://github.com/TailAdmin/free-nextjs-admin-dashboard)
- 🌐 [Visit TailAdmin website](https://tailadmin.com)
- 💚 Consider purchasing the Pro version to support development

## Acknowledgments

**Special thanks to:**

- [TailAdmin](https://tailadmin.com) - For the excellent Next.js dashboard template
- [Next.js Team](https://nextjs.org) - For the amazing framework
- [React Team](https://react.dev) - For React 19
- [Tailwind CSS Team](https://tailwindcss.com) - For the CSS framework
