import React from 'react';

const MobileLinksModal = props => {
  const links = [];
  
  // Remove the active page's component from the links.
  if (props && props.links) {
    props.links.forEach(link => {
      const activePageFromLinks = link?.props?.children?.props?.children[1]?.props?.children;

      if (activePageFromLinks) {
        if (props.activePage) {
          if (props.activePage !== activePageFromLinks) {
            links.push(link);
          }
        }
      }
    });
  }

  return(
    <div className="navbar-links-mobile">{links}</div>
  )
};

export default MobileLinksModal;
