import { Helmet } from 'react-helmet-async';
// sections
import LinkedInUrlsListView from 'src/sections/linkedInUrls/linkedin-urls-list-view';

// ---

export default function LinkedInUrlsPage() {
  return (
    <>
      <Helmet>
        <title>LinkedIn URLs | Dashboard</title>
      </Helmet>
      <LinkedInUrlsListView />
    </>
  );
}
