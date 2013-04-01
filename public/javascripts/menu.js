
var Menu = oHelpers.createClass(
{
    _aFavOptions: null,
    _aNormalOptions: null,
    _iNumFavorites: 0,
    _fnOnSelect: null,
    _jMenu: null,
    _oKeyable: null,
    _sLastQuery: '',
    
    __init__: function(aOptions, aFavKeys, jParent, oScope, fnOnSelect)
    {
        // Save copy of options array.
        this._aNormalOptions = aOptions.slice();
        
        // Extract Favorites.
        this._aFavOptions = [];
        for (var iFavKeyIndex in aFavKeys)
        {
            for (var iOptionIndex in this._aNormalOptions)
            {
                var sFavKey = aFavKeys[iFavKeyIndex];
                var oOption = this._aNormalOptions[iOptionIndex];
                if (oOption.sKey == sFavKey)
                {
                    this._aFavOptions.push(oOption);
                    this._aNormalOptions.splice(iOptionIndex, 1);
                    break;
                }
            }
        }
        
        // Save select callback.
        this._fnOnSelect = oHelpers.createCallback(oScope, fnOnSelect);

        // Init.
        this._jMenu = $(
            '<div class="menu" >' +
                '<div class="menu-search">'+
                    '<input type="text" autocomplete="off"/>' +
                '</div>' + 
                '<div class="menu-options">' +
                '</div>' +
            '</div>'
        );
        this._oKeyable = new Keyable(this._jMenu);
        this._renderOptions();
        jParent.append(this._jMenu);
        this._oKeyable.update();
    },

    attach: function()
    {
        oHelpers.on(window, 'keydown.menu', this, this._onKeyDown);
        oHelpers.on(window, 'keyup.menu', this, this._onKeyUp);
        oHelpers.on(this._jMenu, 'click.menu', this, this._selectClicked);
        this._oKeyable.attach();
        this._jMenu.find('.menu-search input').focus();
        this._oKeyable.update();
    },

    detach: function()
    {
        $(window).off('.menu');
        this._oKeyable.detach();
    },
    
    highlight: function(sKey)
    {
        var jOption = this._jMenu.find('.option#' + sKey);
        oHelpers.assert(jOption.length, 'Option not visible. ');
        this._oKeyable.select(jOption);
        this._scrollIntoView(jOption);
    },
        
    _renderOptions: function(sOptionalFilter)
    {
        // Clear old options.
        var jOptionsParent = this._jMenu.children('.menu-options');
        jOptionsParent.empty();
    
        // Filter options.
        var sSearch = (sOptionalFilter || '').toLowerCase();
        var aFavOptions    = this._grepOptions(this._aFavOptions   , sSearch);
        var aNormalOptions = this._grepOptions(this._aNormalOptions, sSearch);
        
        // Create favorite options.
        if (aFavOptions.length)
        {
            var jFavs = $('<div class="menu-favs"></div>').appendTo(jOptionsParent);
            for (var i = 0; i < aFavOptions.length; i++)
                this._appendOption(jFavs, aFavOptions[i]);
        }
        
        // Create normal options.
        for (var i = 0; i < aNormalOptions.length; i++)
            this._appendOption(jOptionsParent, aNormalOptions[i]);
        
        // Update keyable.
        this._oKeyable.update();
    },
    
    _grepOptions: function(aOptions, sSearch)
    {
        return jQuery.grep(aOptions, function(oOption)
        {
            return oOption.sText.toLowerCase().indexOf(sSearch) != -1 ||
                   oOption.sKey.toLowerCase().indexOf(sSearch) != -1;
        });
    },
    
    _appendOption: function(jParent, oOption)
    {
        var jOption = $('<div class="option keyable mode"></div>');
        jOption.text(oOption.sText).attr('id', oOption.sKey);
        jParent.append(jOption);
    },
    
    _scrollIntoView: function(jElem)
    {
        // Calculate the element's position.
        var jViewport = jElem.offsetParent();
        var iTop = jElem.position().top - parseInt(jViewport.css('paddingTop'));
        var iBottom = jViewport[0].clientHeight - (iTop + jElem[0].offsetHeight)
            
        // Scroll element vertically into view.
        var iScrollTop = null;
        if (iTop < 0)
        {
            iScrollTop = jViewport.scrollTop() + iTop;
            jViewport.scrollTop(iScrollTop);
        }
        else if (iBottom < 0)
        {
            iScrollTop = jViewport.scrollTop() - iBottom;
            jViewport.scrollTop(iScrollTop);
        }
    },

    _onKeyDown: function(oEvent)
    {
        switch (oEvent.which)
        {
            // Select next down div
            case 40: // Down arrow
                this._oKeyable.moveDown();
                this._scrollIntoView(this._oKeyable.getSelected());
                oEvent.preventDefault();
                
                break;
            // Select next up div
            case 38: // Up arrow
                this._oKeyable.moveUp();
                this._scrollIntoView(this._oKeyable.getSelected());
                oEvent.preventDefault();
                break;
    
            // On choice
            case 13:
                this._selectCur();
                break;
            
            default:
                this._jMenu.find('.menu-search input').focus();
        }        
    },

    _onKeyUp: function()
    {
        var sQuery = this._jMenu.find('.menu-search input').val();
        if (this._sLastQuery != sQuery)
            this._renderOptions(sQuery);
        
        this._sLastQuery = sQuery;
    },
    
    _selectCur: function()
    {
        var sKey = this._oKeyable.getSelected().attr('id');
        this._fnOnSelect(sKey);
    },
    
    _selectClicked: function(oEvent)
    {
        var jOption = $(oEvent.target).closest('.option.keyable');
        if (jOption.length)
        {
            this._oKeyable.select(jOption);
            this._selectCur();
        }
    }
});