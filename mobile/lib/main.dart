import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import 'src/providers/theme_provider.dart';
import 'src/theme/app_theme.dart';
import 'src/screens/auth/login_screen.dart';

// Fallback delegate for MaterialLocalizations to use English for unsupported locales like 'om'
class FallbackMaterialLocalizationDelegate extends LocalizationsDelegate<MaterialLocalizations> {
  const FallbackMaterialLocalizationDelegate();

  @override
  bool isSupported(Locale locale) => locale.languageCode == 'om';

  @override
  Future<MaterialLocalizations> load(Locale locale) async {
    return await GlobalMaterialLocalizations.delegate.load(const Locale('en'));
  }

  @override
  bool shouldReload(FallbackMaterialLocalizationDelegate old) => false;
}

// Fallback delegate for CupertinoLocalizations to use English for unsupported locales like 'om'
class FallbackCupertinoLocalizationDelegate extends LocalizationsDelegate<CupertinoLocalizations> {
  const FallbackCupertinoLocalizationDelegate();

  @override
  bool isSupported(Locale locale) => locale.languageCode == 'om';

  @override
  Future<CupertinoLocalizations> load(Locale locale) async {
    return await GlobalCupertinoLocalizations.delegate.load(const Locale('en'));
  }

  @override
  bool shouldReload(FallbackCupertinoLocalizationDelegate old) => false;
}

// Fallback delegate for WidgetsLocalizations to use English for unsupported locales like 'om'
class FallbackWidgetsLocalizationDelegate extends LocalizationsDelegate<WidgetsLocalizations> {
  const FallbackWidgetsLocalizationDelegate();

  @override
  bool isSupported(Locale locale) => locale.languageCode == 'om';

  @override
  Future<WidgetsLocalizations> load(Locale locale) async {
    return await GlobalWidgetsLocalizations.delegate.load(const Locale('en'));
  }

  @override
  bool shouldReload(FallbackWidgetsLocalizationDelegate old) => false;
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();

  runApp(
    EasyLocalization(
      supportedLocales: const [
        Locale('en'),
        Locale('am'),
        Locale('om'),
      ],
      path: 'assets/translations',
      fallbackLocale: const Locale('en'),
      child: ChangeNotifierProvider(
        create: (_) => ThemeProvider(),
        child: const MyApp(),
      ),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isAmharic = context.locale.languageCode == 'am';

    return MaterialApp(
      title: 'FLEGA',
      localizationsDelegates: [
        ...context.localizationDelegates,
        const FallbackMaterialLocalizationDelegate(),
        const FallbackCupertinoLocalizationDelegate(),
        const FallbackWidgetsLocalizationDelegate(),
      ],
      supportedLocales: context.supportedLocales,
      locale: context.locale,
      debugShowCheckedModeBanner: false,
      
      themeMode: themeProvider.themeMode,
      theme: AppTheme.lightTheme.copyWith(
        textTheme: isAmharic
            ? AppTheme.lightTheme.textTheme.apply(fontFamily: 'NotoSansEthiopic')
            : null,
      ),
      darkTheme: AppTheme.darkTheme.copyWith(
        textTheme: isAmharic
            ? AppTheme.darkTheme.textTheme.apply(fontFamily: 'NotoSansEthiopic')
            : null,
      ),
      home: const LoginScreen(),
    );
  }
}
