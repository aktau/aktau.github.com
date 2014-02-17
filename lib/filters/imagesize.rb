# vim: set ts=2 sw=2 et ai ft=ruby:

# Idea from here:
# http://userprimary.net/posts/2011/01/10/optimizing-nanoc-based-websites/
# Also uses code from other filters that are shipped with Nanoc itself.
#
# Implementation enhanced by Pascal Bleser <loki@fosdem.org>,
# under either GPL2 (GNU General Public License) or ASL2.1 (Apache Software License)
# or BSD-3-Clause, as you wish (short version: do whatever you want with it ;)).
#
# Put this file into lib/helpers/ (or lib/filters/, would be better structured)
# and add an invocation of "filter :imagesize" in your Rules, e.g. like this:
# compile '*' do
#   filter :imagesize unless item.binary?
# end

class ImageSizeFilter < Nanoc::Filter
  type :text
  identifier :imagesize

  @@SELECTORS = [ 'img' ]

  def run(content, params={})
    # Set assigns so helper function can be used
    @item_rep = assigns[:item_rep] if @item_rep.nil?

    selectors  = params.fetch(:select) { @@SELECTORS }
    namespaces = params[:namespaces] || {}

    require 'nokogiri'
    klass = ::Nokogiri::HTML

    add_image_size(content, selectors, namespaces, klass, 'html')
  end

  protected
  def add_image_size(content, selectors, namespaces, klass, type)
    # Ensure that all prefixes are strings
    namespaces = namespaces.inject({}) { |new, (prefix, uri)| new.merge(prefix.to_s => uri) }

    doc = content =~ /<html[\s>]/ ? klass.parse(content) : klass.fragment(content)
    selectors.map { |sel| "#{sel}" }.each do |selector|
      doc.css(selector, namespaces)
      .select { |node| node.is_a? Nokogiri::XML::Element }
      .select { |img| img.has_attribute?('src') }
      .each do |img|
        path = img['src']
        dimensions = image_size(path)
        dimensions.each{|k,v| img[k.to_s] = v.to_s}
      end
    end
    result = doc.send("to_#{type}")

    result
  end

  def image_size(path)
    require 'image_size'
    path = '/' + path unless path[0, 1] == '/'
    img = ImageSize.new(IO.read("output#{path}"))
    { :height => img.height, :width => img.width }
  end
end
