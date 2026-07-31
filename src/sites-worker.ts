interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface SitesEnvironment {
  ASSETS: AssetsBinding;
}

const worker = {
  async fetch(request: Request, environment: SitesEnvironment): Promise<Response> {
    return environment.ASSETS.fetch(request);
  },
};

export default worker;
