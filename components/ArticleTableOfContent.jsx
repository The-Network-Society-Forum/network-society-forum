import { useEffect, useRef, useState, forwardRef } from 'react';
import clsx from 'clsx';

const ArticleTableOfContent = ({ post }, ref) => {
  const [headingElements, setHeadingElements] = useState([]);
  const [visibleHeadingIds, setVisibleHeadingIds] = useState([]);
  const [activeId, setActiveId] = useState('');
  const observer = useRef();

  useEffect(() => {
    if (!ref.current) return;

    const handleObsever = (entries) => {
      entries.forEach((entry) => {
        const targetId = entry.target.id;
        if (entry?.isIntersecting) {
          setVisibleHeadingIds((v = []) => {
            if (!v.includes(targetId)) {
              // return all visible headings sorted by order of appearance
              return [...v, targetId].sort((a = '0', b = '0') => {
                return a[a.length - 1] - b[b.length - 1];
              });
            }
          });
        } else {
          setVisibleHeadingIds((v = []) => {
            const newVisibleHeadingIds = v.filter((id) => id !== targetId);
            return newVisibleHeadingIds;
          });
        }
      });
    };
    observer.current = new IntersectionObserver(handleObsever, {
      rootMargin: '-0% 0% 0% 0px',
    });

    const articleElement = ref.current;
    const headingElements = Array.from(
      articleElement.querySelectorAll('h2, h3, h4, h5, h6')
    ).map((elem, i) => {
      observer.current?.observe(elem);
      const text = elem.innerText;
      const id = `article-heading-${i}`.replaceAll(' ', '_');
      elem.setAttribute('id', id);
      return {
        id,
        text,
        level: Number(elem.nodeName.charAt(1)),
      };
    });
    setHeadingElements(headingElements);

    return () => observer.current?.disconnect();
  }, [ref.current]);

  const getClassName = (level) => {
    switch (level) {
      case 2:
        return 'text-base';
      case 3:
        return 'text-sm pl-3';
      case 4:
        return 'text-xs pl-6';
      case 5:
        return 'text-xs pl-9';
      case 6:
        return 'text-xs pl-12';
      default:
        return '';
    }
  };

  // Select the topmost heading
  useEffect(() => {
    if (visibleHeadingIds?.length) {
      const isElementVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const windowHeight =
          window.innerHeight || document.documentElement.clientHeight;
        const windowWidth =
          window.innerWidth || document.documentElement.clientWidth;

        return (
          (rect.top >= 0 && rect.top < windowHeight) ||
          (rect.bottom > 0 && rect.bottom <= windowHeight) ||
          rect.height > windowHeight
        );
      };

      const newActiveId = visibleHeadingIds[0];
      setActiveId(newActiveId);
      const tocItem = document.querySelector(`#toc-item-${newActiveId}`);
      if (!isElementVisible(tocItem)) tocItem.scrollIntoView();
    }
  }, [visibleHeadingIds]);

  return (
    <aside className='sticky top-0 left-0 h-screen overflow-y-auto scrollbar-hide hidden border-r border-primary xl:block xl:w-64 md:shrink-0 pt-6 pb-12 md:pb-20'>
      <div className='md:pr-6 lg:pr-10'>
        <div className='space-y-6 text-primary'>
          <h2 className='text-lg font-serif uppercase'>
            {post?.content?.title}
          </h2>
          <ul>
            {headingElements.map((headingElement, i) => {
              return (
                <li
                  key={`${headingElement.id}-${i}`}
                  id={`toc-item-${headingElement.id}`}
                  className={getClassName(headingElement.level)}
                >
                  <a
                    href={headingElement.id}
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .querySelector(`#${headingElement.id}`)
                        .scrollIntoView({
                          behavior: 'smooth',
                        });
                    }}
                    className={clsx('block py-1', {
                      'text-brand': headingElement.id === activeId,
                    })}
                  >
                    {headingElement.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
};
export default forwardRef(ArticleTableOfContent);
