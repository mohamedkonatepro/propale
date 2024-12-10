import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document';

// Étendre le type DocumentInitialProps pour inclure isCreateProspectPage
interface CustomDocumentProps extends DocumentInitialProps {
  isCreateProspectPage?: boolean;
}

class MyDocument extends Document<CustomDocumentProps> {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<CustomDocumentProps> {
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => App,
        enhanceComponent: (Component) => Component,
      });

    const initialProps = await Document.getInitialProps(ctx);

    // Vérifiez si l'URL commence par /create-prospect/
    const isCreateProspectPage = ctx.req?.url?.startsWith('/create-prospect/');

    return { ...initialProps, isCreateProspectPage };
  }

  render() {
    // Utiliser la valeur isCreateProspectPage pour changer la classe de body
    const { isCreateProspectPage } = this.props;
    const bodyClass = isCreateProspectPage ? 'bg-white' : 'bg-backgroundGray';

    return (
      <Html lang="fr">
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
          <body className={bodyClass}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
