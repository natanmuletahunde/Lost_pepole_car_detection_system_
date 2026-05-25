import 'package:flutter/material.dart';

class AppTheme {
  // Common visual rules:
  static const double cardRadius = 16.0;
  static const double buttonRadius = 30.0;

  // PREMIUM LIGHT THEME (Matches Web Light Design System)
  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF0034D1),
      primary: const Color(0xFF0034D1),
      primaryContainer: const Color(0xFFEAF2FF),
      onPrimaryContainer: const Color(0xFF002294),
      secondary: const Color(0xFF2F80ED),
      surface: Colors.white,
      background: const Color(0xFFF8F9FA),
      onBackground: const Color(0xFF1E293B),
      onSurface: const Color(0xFF1E293B),
      onSurfaceVariant: const Color(0xFF64748B),
      error: const Color(0xFFEF4444),
    ),
    scaffoldBackgroundColor: const Color(0xFFF8F9FA),
    dividerColor: const Color(0xFFE2E8F0),
    cardTheme: const CardTheme(
      color: Colors.white,
      elevation: 2,
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(cardRadius)),
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF0034D1),
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF0034D1),
        foregroundColor: Colors.white,
        elevation: 2,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(buttonRadius),
        ),
      ),
    ),
  );

  // PREMIUM DARK THEME (Matches Web Dark Design System)
  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: Color(0xFF2563EB),
      primaryContainer: Color(0xFF1E293B),
      onPrimaryContainer: Color(0xFF60A5FA),
      secondary: Color(0xFF60A5FA),
      surface: Color(0xFF1E293B),
      background: Color(0xFF0F172A),
      onBackground: Color(0xFFF1F5F9),
      onSurface: Color(0xFFF1F5F9),
      onSurfaceVariant: Color(0xFF94A3B8),
      error: Color(0xFFEF4444),
    ),
    scaffoldBackgroundColor: const Color(0xFF0F172A),
    dividerColor: const Color(0xFF334155),
    cardTheme: const CardTheme(
      color: Color(0xFF1E293B),
      elevation: 4,
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(cardRadius)),
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF0F172A),
      foregroundColor: Color(0xFFF1F5F9),
      elevation: 0,
      centerTitle: false,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        elevation: 2,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(buttonRadius),
        ),
      ),
    ),
  );
}
