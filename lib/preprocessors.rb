# Preprocessor helpers
#
# This file has a collection of methods that are meant to be used in the
# preprocess-block in the Nanoc Rules file.
#
# @author Arjan van der Gaag


# Generate a sitemap.xml file using Nanoc's own xml_sitemap helper method by
# dynamically adding a new item.
#
# Make items that should not appear in the sitemap hidden. This by default
# works on all image files and typical assets, as well as error pages and
# htaccess. The is_hidden attribute is only explicitly set if it is absent,
# allowing per-file overriding.
#
# @todo extract hidden file types into configuration file?
def create_sitemap
  @items.each do |item|
    if %w{png gif jpg jpeg coffee scss sass less css xml js txt}.include?(item[:extension]) ||
        item.identifier =~ /404|500|htaccess|google|CNAME/ || item.attributes.fetch(:draft, false) == true ||
        item[:tag] != nil
      item[:is_hidden] = true unless item.attributes.has_key?(:is_hidden)
    end
  end

  @items << Nanoc3::Item.new(
    "<%= xml_sitemap %>",
    { :extension => 'xml', :is_hidden => true },
    '/sitemap/'
  )
end
