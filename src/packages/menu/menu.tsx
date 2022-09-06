import React, { FunctionComponent, useEffect, useRef, useState } from 'react'
import classnames from 'classnames'
import Icon from '@/packages/icon'
import { OptionItem } from '@/packages/menuitem/menuitem'

export interface MenuProps {
  className: string
  style: React.CSSProperties
  activeColor: string
  closeOnClickOverlay: boolean
  scrollFixed: boolean | string | number
  lockScroll: boolean
  titleIcon: string
  children: React.ReactNode
}

const defaultProps = {
  className: '',
  style: {},
  activeColor: '#F2270C',
  closeOnClickOverlay: true,
  scrollFixed: false,
  lockScroll: true,
  titleIcon: '',
} as MenuProps
export const Menu: FunctionComponent<Partial<MenuProps>> = (props) => {
  const {
    className,
    titleIcon,
    scrollFixed,
    lockScroll,
    closeOnClickOverlay,
    children,
    activeColor,
    ...rest
  } = {
    ...defaultProps,
    ...props,
  }
  const parentRef = useRef(null)
  const [isScrollFixed, setIsScrollFixed] = useState(false)

  const getScrollTop = (el: Element | Window) => {
    return Math.max(0, 'scrollTop' in el ? el.scrollTop : el.pageYOffset)
  }
  const onScroll = () => {
    const { scrollFixed } = props

    const scrollTop = getScrollTop(window)
    console.log(scrollTop)
    const isFixed =
      scrollTop > (typeof scrollFixed === 'boolean' ? 30 : Number(scrollFixed))
    setIsScrollFixed(isFixed)
  }

  useEffect(() => {
    if (scrollFixed) {
      window.addEventListener('scroll', onScroll)
    }
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [itemShow, setItemShow] = useState<boolean[]>([])
  const [itemTitle, setItemTitle] = useState<string[]>([])
  const toggleItemShow = (index: number) => {
    itemShow[index] = !itemShow[index]
    const temp = itemShow.map((i: boolean, idx) => (idx === index ? i : false))
    setItemShow([...temp])
  }
  const hideItemShow = (index: number) => {
    itemShow[index] = false
    setItemShow([...itemShow])
  }
  const updateTitle = (text: string, index: number) => {
    itemTitle[index] = text
    setItemTitle([...itemTitle])
  }
  const parent = () => {
    return parentRef
  }
  const cloneChildren = () => {
    return React.Children.map(children, (child, index) => {
      return React.cloneElement(child as any, {
        showPopup: itemShow[index],
        orderKey: index,
        activeColor,
        parent: {
          closeOnClickOverlay,
          lockScroll,
          toggleItemShow,
          updateTitle,
          hideItemShow,
          parent,
        },
      })
    })
  }
  console.log('isScrollFixed', isScrollFixed)
  return (
    <div
      className={`nut-menu ${className} ${isScrollFixed ? 'scroll-fixed' : ''}`}
      {...rest}
      ref={parentRef}
    >
      <div
        className={`nut-menu__bar ${
          itemShow.includes(true) ? 'opened' : ''
        } ${className}`}
      >
        {React.Children.toArray(children).map((child, index) => {
          if (!child) return null
          const { disabled, title, value, direction, options } = (child as any)
            .props as any
          const currentTitle = options?.filter(
            (option: OptionItem) => option.value === value
          )

          function finallyTitle() {
            if (title) return title
            if (itemTitle && itemTitle[index]) return itemTitle[index]
            if (currentTitle && currentTitle[0] && currentTitle[0].text)
              return currentTitle[0].text
            return ''
          }

          return (
            <div
              className={`nut-menu__item ${classnames({
                active: itemShow[index],
                disabled,
              })}`}
              style={{ color: itemShow[index] ? activeColor : '' }}
              key={index}
              onClick={() => {
                !disabled && toggleItemShow(index)
              }}
            >
              <div
                className={`nut-menu__title ${classnames({
                  active: itemShow[index],
                  disabled,
                })}`}
              >
                <div className="nut-menu__title-text">{finallyTitle()}</div>
                <Icon
                  className="nut-menu__title-icon"
                  size="10"
                  name={
                    titleIcon ||
                    (direction === 'up' ? 'arrow-up' : 'down-arrow')
                  }
                />
              </div>
            </div>
          )
        })}
      </div>
      {cloneChildren()}
    </div>
  )
}

Menu.defaultProps = defaultProps
Menu.displayName = 'NutMenu'