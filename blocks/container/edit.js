/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal block libraries
 */
const {
    Component,
    Fragment,
} = wp.element;

const {
    __,
    sprintf,
} = wp.i18n;

const { compose } = wp.compose;

const {
    BlockAlignmentToolbar,
    BlockControls,
    InnerBlocks,
    InspectorControls,
    PanelColor,
    withColors,
} = wp.editor;

const {
    PanelBody,
    RangeControl,
} = wp.components;

class gtContainerEdit extends Component {
    constructor() {
        super( ...arguments );
    }

    render() {
        const {
            attributes,
            backgroundColor,
            setBackgroundColor,
            setAttributes,
            isSelected,
            className
        } = this.props;

        const classNames= classnames( className, {
            'has-background': backgroundColor.value,
            [ backgroundColor.class ]: backgroundColor.class,
        } );

        const blockStyles = {
            backgroundColor: backgroundColor.class ? undefined : backgroundColor.value,
        };

        const contentStyles = `
            .wp-block-german-themes-blocks-container .gt-inner-content .editor-block-list__block {
                max-width: ${attributes.contentWidth}px;
            }
            .wp-block-german-themes-blocks-container .gt-inner-content .editor-block-list__block[data-align="wide"],
            .wp-block-german-themes-blocks-container .gt-inner-content .editor-block-list__block[data-align="full"] {
                max-width: inherit;
            }
        `;

        return (
            <Fragment>

                <BlockControls>

                    <BlockAlignmentToolbar
                        value={ attributes.blockAlignment }
                        onChange={ ( newAlign ) => setAttributes( { blockAlignment: newAlign } ) }
                        controls={ [ 'wide', 'full' ] }
                    />

                </BlockControls>

                <InspectorControls>

                    <PanelBody title={ __( 'Layout Settings' ) } initialOpen={ false } className="gt-panel-layout-settings gt-panel">

                        <BlockAlignmentToolbar
                            value={ attributes.blockAlignment }
                            onChange={ ( newAlign ) => setAttributes( { blockAlignment: newAlign } ) }
                            controls={ [ 'wide', 'full' ] }
                        />

                        <RangeControl
                            label={ __( 'Content Width (in px)' ) }
                            value={ attributes.contentWidth }
                            onChange={ ( maxWidth ) => setAttributes( { contentWidth: maxWidth } ) }
                            min={ 100 }
                            max={ 2500 }
                        />

                    </PanelBody>

                    <PanelColor
                        colorValue={ backgroundColor.value }
                        initialOpen={ false }
                        title={ __( 'Background Color' ) }
                        onChange={ setBackgroundColor }
                    />

                </InspectorControls>

                <div className={ classNames } style={ blockStyles }>
                    <style>{ contentStyles }</style>
                    <div className="gt-inner-content">
                        <InnerBlocks />
                    </div>
                </div>

            </Fragment>
        );
    }
}

export default compose( [
    withColors( 'backgroundColor' )
] )( gtContainerEdit );
