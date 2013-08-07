# All files in the 'lib' directory will be loaded
# before nanoc starts compiling.

module PostHelper
  def get_pretty_date(post)
    attribute_to_time(post[:created_at]).strftime('%B %-d, %Y')
  end

  def get_post_start(post)
    content = post.compiled_content
    if content =~ /\s<!-- more -->\s/
      content = content.partition('<!-- more -->').first +
        "<div class='read-more'>" + link_to('Continue reading &rsaquo;', post.path) + "</div>"
    end
    return content
  end
end

include PostHelper

include Nanoc3::Helpers::Blogging
include Nanoc3::Helpers::Tagging
include Nanoc3::Helpers::Rendering
include Nanoc3::Helpers::LinkTo

Encoding.default_internal = Encoding::UTF_8