/**
 * External dependencies
 */
import classnames from 'classnames';
import {
    isEmpty,
    map,
    range,
    startCase,
    uniq,
} from 'lodash';

/**
 * Block dependencies
 */
import { default as FeaturesImage } from './features-image';
import {
    gtTwoColumns,
    gtThreeColumns,
    gtFourColumns,
} from './icons';

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

const { withSelect } = wp.data;
const { compose } = wp.compose;

const {
    AlignmentToolbar,
    BlockAlignmentToolbar,
    BlockControls,
    ContrastChecker,
    InspectorControls,
    PanelColorSettings,
    RichText,
    URLInput,
    withColors,
    withFontSizes,
 } = wp.editor;

 const {
    Button,
    Dashicon,
    FontSizePicker,
    IconButton,
    PanelBody,
    RangeControl,
    SelectControl,
    ToggleControl,
    Toolbar,
    withFallbackStyles,
 } = wp.components;

/* Block Alignment Controls */
const blockAlignmentControls = {
    center: {
        icon: 'align-center',
        title: __( 'Align center' ),
    },
    wide: {
        icon: 'align-wide',
        title: __( 'Wide width' ),
    },
    full: {
        icon: 'align-full-width',
        title: __( 'Full width' ),
    },
};

/* Column Icons */
const columnIcons = {
    2: gtTwoColumns,
    3: gtThreeColumns,
    4: gtFourColumns,
};

const { getComputedStyle } = window;

const applyFallbackStyles = withFallbackStyles( ( node, ownProps ) => {
	const { textColor, backgroundColor, fontSize, customFontSize } = ownProps.attributes;
	const editableNode = node.querySelector( '[contenteditable="true"]' );
	//verify if editableNode is available, before using getComputedStyle.
	const computedStyles = editableNode ? getComputedStyle( editableNode ) : null;
	return {
		fallbackBackgroundColor: backgroundColor || ! computedStyles ? undefined : computedStyles.backgroundColor,
		fallbackTextColor: textColor || ! computedStyles ? undefined : computedStyles.color,
		fallbackFontSize: fontSize || customFontSize || ! computedStyles ? undefined : parseInt( computedStyles.fontSize ) || undefined,
	};
} );

class gtFeaturesEdit extends Component {
    constructor() {
        super( ...arguments );

        this.addFeaturesItem = this.addFeaturesItem.bind( this );
        this.onSelectImage   = this.onSelectImage.bind( this );
        this.onRemoveImage   = this.onRemoveImage.bind( this );
        this.addImageSize    = this.addImageSize.bind( this );
        this.updateImageURLs = this.updateImageURLs.bind( this );
        this.onChangeTitle   = this.onChangeTitle.bind( this );
        this.onChangeText    = this.onChangeText.bind( this );
        this.onChangeItemURL = this.onChangeItemURL.bind( this );

        this.state = {
            imageSizes: {},
        };
    }

    addFeaturesItem() {
        const newItems = [...this.props.attributes.items];
        newItems.push( { 'title': '', 'text': '' } );
        this.props.setAttributes( { items: newItems } );
    }

    moveUpFeaturesItem( index ) {
        // Return early if item is already on top.
        if ( index === 0 ) {
            return false;
        }

        // Swap Items.
        const newItems = [...this.props.attributes.items];
        [newItems[index-1], newItems[index]] = [newItems[index], newItems[index-1]];
        this.props.setAttributes( { items: newItems } );
    }

    moveDownFeaturesItem( index ) {
        const newItems = [...this.props.attributes.items];

        // Return early if item is already on top.
        if ( ( index + 1 ) === newItems.length ) {
            return false;
        }

        // Swap Items.
        [newItems[index], newItems[index+1]] = [newItems[index+1], newItems[index]];
        this.props.setAttributes( { items: newItems } );
    }

    removeFeaturesItem( index ) {
        const newItems = [...this.props.attributes.items].filter( (value, key) => key !== index );
        this.props.setAttributes( { items: newItems } );
    }

    onSelectImage( img, index ) {
        const newItems = [...this.props.attributes.items];
        if( newItems[index] !== undefined ) {
            const newImgURL = this.getImageURL( img.id, this.props.attributes.imageSize );
            newItems[index].imgID = img.id;
            newItems[index].imgURL = newImgURL ? newImgURL : img.url;
            newItems[index].imgAlt = img.alt;
        }
        this.props.setAttributes( { items: newItems } );
    }

    onRemoveImage( index ) {
        const newItems = [...this.props.attributes.items];
        if( newItems[index] !== undefined ) {
            newItems[index].imgID = null;
            newItems[index].imgURL = null;
            newItems[index].imgAlt = null;
        }
        this.props.setAttributes( { items: newItems } );
    }

    addImageSize( imgID, sizeObj ) {
        const newSizes = { ...this.state.imageSizes };
        if( ! newSizes[imgID] ) {
            newSizes[imgID] = sizeObj;
            this.setState( { imageSizes: newSizes } );

            // Update Image URLs after new Image Sizes were added.
            const newItems = [...this.props.attributes.items];
            newItems.forEach( ( item, index ) => {
                if( item.imgID === imgID ) {
                    const newURL = this.getImageURL( item.imgID, this.props.attributes.imageSize, newSizes );

                    if( newItems[index].imgURL !== newURL ) {
                        newItems[index].imgURL = newURL;
                        this.props.setAttributes( { items: newItems } );
                    }
                }
            });
        }
    }

    getImageURL( imgID, size, imageSizes = this.state.imageSizes ) {
        // Check if image exists in imageSizes state.
        if( imageSizes[imgID] !== undefined ) {

            // Get image from imageSizes array.
            const image = imageSizes[imgID];

            // Select the new Image Size.
            const newSize = ( image[size] !== undefined ) ? image[size] : image['full'];

            return newSize['source_url'];
        }
        return null;
    }

    updateImageURLs( size ) {
        const newItems = [...this.props.attributes.items];
        newItems.forEach( ( item, index ) => {
            newItems[index].imgURL = this.getImageURL( item.imgID, size );
        });

        this.props.setAttributes( {
            items: newItems,
            imageSize: size,
        } );
    }

    onChangeTitle( newTitle, index ) {
        const newItems = [...this.props.attributes.items];
        if( newItems[index] !== undefined ) {
            newItems[index].title = newTitle;
        }
        this.props.setAttributes( { items: newItems } );
    }

    onChangeText( newText, index ) {
        const newItems = [...this.props.attributes.items];
        if( newItems[index] !== undefined ) {
            newItems[index].text = newText;
        }
        this.props.setAttributes( { items: newItems } );
    }

    onChangeItemURL( newItemURL, index ) {
        const newItems = [...this.props.attributes.items];
        if( newItems[index] !== undefined ) {
            newItems[index].itemURL = newItemURL;
        }
        this.props.setAttributes( { items: newItems } );
    }

    getAvailableSizes() {
        const availableSizes = Object.values( this.state.imageSizes )
            .map( img => Object.keys(img) )
            .reduce( ( sizes, img ) => sizes.concat( img ), [] );
        return uniq( availableSizes );
    }

    render() {
        const {
            attributes,
            backgroundColor,
            setBackgroundColor,
            fallbackBackgroundColor,
            textColor,
            setTextColor,
            fallbackTextColor,
            fontSize,
            setFontSize,
            fallbackFontSize,
            fontSizes,
            setAttributes,
            isSelected,
            className,
            wideControlsEnabled,
        } = this.props;

        const availableSizes = this.getAvailableSizes();

        const classNames= classnames( className, {
            [ `gt-columns-${ attributes.columns }` ]: attributes.columns,
        } );

        const contentClasses = classnames( 'gt-content', {
            'has-background': backgroundColor.value,
            [ backgroundColor.class ]: backgroundColor.class,
        } );

        const contentStyles = {
            textAlign: attributes.textAlignment,
            backgroundColor: backgroundColor.class ? undefined : backgroundColor.value,
        };

        const textClasses = classnames( 'gt-text', {
            'has-text-color': textColor.value,
            [ textColor.class ]: textColor.class,
            [ fontSize.class ]: fontSize.class,
        } );

        const textStyles = {
            fontSize: fontSize.size ? fontSize.size + 'px' : undefined,
            color: textColor.class ? undefined : textColor.value,
        };

        const titleTag = 'h' + attributes.titleTag;

        return (
            <Fragment>
                <BlockControls key="controls">

                    <BlockAlignmentToolbar
                        value={ attributes.blockAlignment }
                        onChange={ ( newAlign ) => setAttributes( { blockAlignment: newAlign } ) }
                        controls={ [ 'wide', 'full' ] }
                    />

                    <Toolbar
                        controls={
                            [ 2, 3, 4 ].map( column => ( {
                                icon: columnIcons[ column ],
                                title: sprintf( __( '%s Columns' ), column ),
                                isActive: column === attributes.columns,
                                onClick: () => setAttributes( { columns: column } ),
                            } ) )
                        }
                    />

                    <AlignmentToolbar
                        value={ attributes.textAlignment }
                        onChange={ ( newAlignment ) => setAttributes( { textAlignment: newAlignment } ) }
                    />

                </BlockControls>

                <InspectorControls key="inspector">

                    <PanelBody title={ __( 'Layout Settings' ) } initialOpen={ false } className="gt-panel-layout-settings gt-panel">

                        <RangeControl
                            label={ __( 'Columns' ) }
                            value={ attributes.columns }
                            onChange={ ( nextColumns ) => setAttributes( { columns: nextColumns } ) }
                            min={ 2 }
                            max={ 6 }
                        />

                        { wideControlsEnabled && [
                            <p><label className="blocks-base-control__label">{ __( 'Block Alignment' ) }</label></p>,
                            <BlockAlignmentToolbar
                                value={ attributes.blockAlignment }
                                onChange={ ( newAlign ) => setAttributes( { blockAlignment: newAlign } ) }
                                controls={ [ 'center', 'wide', 'full' ] }
                            />
                        ] }

                    </PanelBody>

                    <PanelBody title={ __( 'Image Settings' ) } initialOpen={ false } className="gt-panel-image-settings gt-panel">

                        { ! isEmpty( availableSizes ) && (
                            <SelectControl
                                label={ __( 'Size' ) }
                                value={ attributes.imageSize }
                                options={ map( availableSizes, ( size ) => ( {
                                    value: size,
                                    label: startCase( size ),
                                } ) ) }
                                onChange={ this.updateImageURLs }
                            />
                        ) }

                    </PanelBody>

                    <PanelBody title={ __( 'Text Settings' ) } initialOpen={ false } className="gt-panel-text-settings gt-panel">

                        <p><label className="blocks-base-control__label">{ __( 'Heading' ) }</label></p>
                        <Toolbar
                            controls={
                            range( 1, 7 ).map( ( level ) => ( {
                                icon: 'heading',
                                title: sprintf( __( 'Heading %s' ), level ),
                                isActive: level === attributes.titleTag,
                                onClick: () => setAttributes( { titleTag: level } ),
                                subscript: level,
                            } ) )
                            }
                        />

                        <p><label className="blocks-base-control__label">{ __( 'Font Size' ) }</label></p>
                        <FontSizePicker
                            fontSizes={ fontSizes }
                            fallbackFontSize={ fallbackFontSize }
							value={ fontSize.size }
							onChange={ setFontSize }
						/>

                    </PanelBody>

                    <PanelColorSettings
                        title={ __( 'Color Settings' ) }
                        colorSettings={ [
                            {
                                value: backgroundColor.value,
                                onChange: setBackgroundColor,
                                label: __( 'Background Color' ),
                            },
                            {
                                value: textColor.value,
                                onChange: setTextColor,
                                label: __( 'Text Color' ),
                            },
                        ] }
                    >

                        <ContrastChecker
                            { ...{
                                textColor: textColor.value,
                                backgroundColor: backgroundColor.value,
                                fallbackTextColor,
                                fallbackBackgroundColor,
                            } }
                            fontSize={ fontSize.size }
                        />
                    </PanelColorSettings>

                </InspectorControls>

                <div className={ classNames }>
                    <div className="gt-grid-container">

                        {
                            attributes.items.map( ( item, index ) => {
                                return (
                                    <div className="gt-grid-item" key={ index }>

                                        <FeaturesImage
                                            imgID={ item.imgID }
                                            imgURL={ item.imgURL }
                                            imgAlt={ item.imgAlt }
                                            onSelect={ ( img ) => this.onSelectImage( img, index ) }
                                            onRemove={ () => this.onRemoveImage( index ) }
                                            addSize={ this.addImageSize }
                                            isSelected={ isSelected }
                                        />

                                        <div className={ contentClasses } style={ contentStyles }>

                                            <RichText
                                                tagName={ titleTag }
                                                placeholder={ __( 'Enter a title' ) }
                                                value={ item.title }
                                                onChange={ ( newTitle ) => this.onChangeTitle( newTitle, index ) }
                                                formattingControls={ [ 'bold', 'italic', 'strikethrough' ] }
                                                keepPlaceholderOnFocus
                                            />

                                            <RichText
                                                tagName="div"
                                                multiline="p"
                                                placeholder={ __( 'Enter your text here.' ) }
                                                value={ item.text }
                                                className={ textClasses }
                                                style={ textStyles }
                                                onChange={ ( newText ) => this.onChangeText( newText, index ) }
                                                keepPlaceholderOnFocus
                                            />

                                        </div>

                                        { isSelected && (
                                            <Fragment>

                                                <form
                                                    className="gt-url-input"
                                                    onSubmit={ ( event ) => event.preventDefault() }>
                                                    <Dashicon icon="admin-links" />
                                                    <URLInput
                                                        value={ item.itemURL }
                                                        onChange={ ( newItemURL ) => this.onChangeItemURL( newItemURL, index ) }
                                                        autoFocus= { false }
                                                    />
                                                    <IconButton icon="editor-break" label={ __( 'Apply' ) } type="submit" />
                                                </form>

                                                <div className="gt-grid-item-controls">
                                                    <div className="gt-grid-item-number">
                                                        #{ index + 1 }
                                                    </div>

                                                    <IconButton
                                                        className="move-up-features-item"
                                                        label={ __( 'Move up' ) }
                                                        icon="arrow-up-alt2"
                                                        onClick={ () => this.moveUpFeaturesItem( index ) }
                                                        disabled={ index === 0 }
                                                    />

                                                    <IconButton
                                                        className="move-down-features-item"
                                                        label={ __( 'Move down' ) }
                                                        icon="arrow-down-alt2"
                                                        onClick={ () => this.moveDownFeaturesItem( index ) }
                                                        disabled={ ( index + 1 ) === attributes.items.length }
                                                    />

                                                    <IconButton
                                                        className="remove-features-item"
                                                        label={ __( 'Remove Item' ) }
                                                        icon="trash"
                                                        onClick={ () => this.removeFeaturesItem( index ) }
                                                    />
                                                </div>
                                            </Fragment>
                                        ) }

                                    </div>
                                );
                            })
                        }

                    </div>

                    { isSelected && (
                        <Button
                            isLarge
                            onClick={ this.addFeaturesItem }
                            className="gt-add-features-item"
                        >
                            <Dashicon icon="insert" />
                            { __( 'Add features item' ) }
                        </Button>
                    ) }
                </div>
            </Fragment>
        );
    }
}

export default compose( [
    withColors( 'backgroundColor', { textColor: 'color' } ),
    withFontSizes( 'fontSize' ),
	applyFallbackStyles,
    withSelect(
        ( select ) => {
            const { fontSizes } = select( 'core/editor' ).getEditorSettings();
            return { fontSizes };
        }
    )
] )( gtFeaturesEdit );
