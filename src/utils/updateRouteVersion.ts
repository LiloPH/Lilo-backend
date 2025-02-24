import { RoutesVersion } from "../models";

const updateVersion = async () => {
  let routesVersion = await RoutesVersion.findOne().exec();

  if (!routesVersion) {
    routesVersion = new RoutesVersion({
      lastModified: new Date(),
      version: 0,
    });
  }

  routesVersion.lastModified = new Date();
  routesVersion.version += 1;
  await routesVersion.save();
};

export default updateVersion;
