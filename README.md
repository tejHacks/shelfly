# **Shelfly: Intuitive Inventory Management Mobile App**

## Overview

Shelfly is a modern cross-platform mobile application designed for efficient inventory management. Built with **React Native** and **Expo** using **TypeScript**, it offers robust features for tracking products, managing stock levels, and handling user authentication, all powered by a local **SQLite** database.

## Features

* ✨ **User Authentication**: Secure signup and login for personalized inventory management.
* 📦 **Comprehensive Product Management**: Effortlessly add, view, edit, and delete products.
* 📸 **Image Integration**: Capture product photos directly or select from your gallery.
* 📊 **Dashboard Overview**: Get immediate insights into total products and low-stock items.
* 💾 **Persistent Local Storage**: All data, including user information and products, is stored securely on the device using SQLite.
* 🎨 **Modern User Interface**: A clean, responsive, and intuitive design crafted with NativeWind and Tailwind CSS.

## Getting Started

Follow these steps to set up and run Shelfly on your local machine.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/tejHacks/shelfly.git
cd shelfly
npm install
```

### Running the Application

To start the Expo development server:

```bash
npx expo start
```

This will open a new tab in your browser with Expo Dev Tools. You can then:

* Scan the QR code with the **Expo Go** app on your physical device (Android or iOS).
* Run on an Android emulator by pressing `a`.
* Run on an iOS simulator by pressing `i`.

## Usage

Once the application is running:

1. **Welcome Screen**: You'll be greeted with an animated welcome screen. Tap "Get Started" to proceed.
2. **Authentication**:
    * **Sign Up**: Create a new account by providing your full name, email, and a password.
    * **Login**: Use your registered email and password to access your store.
3. **Home Dashboard**: Upon logging in, you'll see a dashboard with a greeting, an overview of your total products, and a count of low-stock items. Recently added products are also displayed.
4. **Products Management**:
    * Navigate to the "Products" tab to view your full inventory.
    * Tap the **"+ Add New Product"** button to input product details (name, quantity, price) and optionally add an image from your camera or gallery.
    * For existing products, use the **"Edit"** button to modify details or the **"Delete"** button to remove them from your inventory.
5. **Settings**:
    * In the "Settings" tab, you can update your profile information (name).
    * Change your account password.
    * Log out of your account.
    * Delete your account permanently, along with all associated product data.

## Technologies Used

| Technology             | Description                                          | Link                                                                |
| :--------------------- | :--------------------------------------------------- | :------------------------------------------------------------------ |
| **React Native**       | Cross-platform mobile application framework          | [Official Website](https://reactnative.dev/)                        |
| **Expo**               | Framework for universal React applications           | [Official Website](https://expo.dev/)                               |
| **TypeScript**         | Superset of JavaScript for type safety               | [Official Website](https://www.typescriptlang.org/)                 |
| **Expo Router**        | File-based routing for React Native and web          | [GitHub Repo](https://github.com/expo/router)                       |
| **NativeWind**         | Tailwind CSS for React Native                        | [GitHub Repo](https://github.com/marklawlor/nativewind)             |
| **Tailwind CSS**       | Utility-first CSS framework for rapid styling        | [Official Website](https://tailwindcss.com/)                        |
| **Expo SQLite**        | Local relational database for offline data storage   | [Expo Docs](https://docs.expo.dev/versions/latest/sdk/sqlite/)      |
| **AsyncStorage**       | Persistent key-value storage for React Native        | [GitHub Repo](https://github.com/react-native-async-storage/async-storage) |
| **Expo Image Picker**  | Component for accessing device's image library       | [Expo Docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/) |

## Contributing

We welcome contributions to Shelfly! If you have suggestions or want to improve the project:

* 🐛 **Find a Bug?** Open an issue to report it.
* 💡 **Suggest a Feature?** Open an issue to discuss your ideas.
* 💻 **Contribute Code?**
    1. Fork the repository.
    2. Create a new branch (`git checkout -b feature/YourFeatureName`).
    3. Make your changes and ensure tests pass (if applicable).
    4. Commit your changes (`git commit -m 'feat: Add new feature'`).
    5. Push to the branch (`git push origin feature/YourFeatureName`).
    6. Open a Pull Request.

Please ensure your code adheres to the project's coding style and conventions.

## Author Info

* **LinkedIn**: [https://www.linkedin.com/in/olateju-olamide-22314a292/]
* **Twitter**: [https://x.com/OlatejuOlamid10]
* **Portfolio**: [tejuthedev.vercel.app]

---
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org/)
[![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-0000FF.svg?logo=expo)](https://expo.dev/)
[![Styled with Tailwind CSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-06B6D4.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
