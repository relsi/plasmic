import * as React from 'react';
import { usePlasmicRootContext } from './PlasmicRootProvider';
import { usePlasmicComponent } from './usePlasmicComponent';

const PlasmicComponentContext = React.createContext(false);

export function PlasmicComponent(props: {
  /**
   * Name of the component to render, or the path of the page component
   */
  component: string;
  /**
   * Optionally specify a projectId if there are multiple components
   * of the same name from different projects
   */
  projectId?: string;
  /**
   * If you used registerComponent(), then if the name matches a registered
   * component, that component is used.  If you want the Plasmic-generated
   * component instead, specify forceOriginal.
   */
  forceOriginal?: boolean;
  componentProps?: any;
}): React.ReactElement | null {
  const { component, projectId, componentProps, forceOriginal } = props;

  const rootContext = usePlasmicRootContext();
  const isRootLoader = !React.useContext(PlasmicComponentContext);

  if (!rootContext) {
    // no existing PlasmicRootProvider
    throw new Error(
      `You must use <PlasmicRootProvider/> at the root of your app`
    );
  }

  const lookup = rootContext.loader.getLookup();

  const Component = usePlasmicComponent(
    { name: component, projectId },
    { forceOriginal }
  );

  if (!Component) {
    return null;
  }

  let element = <Component {...componentProps} />;

  if (isRootLoader) {
    // If this is the root PlasmicComponent, then wrap the content with the
    // react-web's PlasmicRootProvider.  We are doing this here, instead of
    // say PlasmicRootProvider, because we don't have access to this context
    // provider until data has been loaded.  If we insert this provider into
    // the tree at the root after data is loaded, then we'll invalidate the
    // React tree and tree state, which is bad.  Instead, we do it at the
    // "root-most PlasmicComponent"; we won't risk invalidating the sub-tree
    // here because there were no children before the data came in.
    const ReactWebRootProvider = lookup.getRootProvider();
    element = (
      <ReactWebRootProvider>
        <PlasmicComponentContext.Provider value={true}>
          {element}
        </PlasmicComponentContext.Provider>
      </ReactWebRootProvider>
    );
  }
  return element;
}
