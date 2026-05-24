import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'en';

  let messages;
  if (locale === 'am') {
    const imported = await import('../messages/am.json');
    messages = imported.default || imported;
  } else {
    const imported = await import('../messages/en.json');
    messages = imported.default || imported;
  }

  return {
    locale,
    messages
  };
});
