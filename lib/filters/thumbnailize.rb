class Thumbnailize < Nanoc::Filter
  identifier :thumbnailize
  type       :binary

  def run(filename, params={})
    if RUBY_PLATFORM =~ /linux/
        system(
          'convert',
          '-resize',
          params[:width].to_s,
          filename,
          output_filename
        )
    elsif RUBY_PLATFORM =~ /darwin/
        system(
          'sips',
          '-Z',
          params[:width].to_s,
          '--out',
          output_filename,
          filename
        )
    else
        raise RuntimeError.new("BUG: platform not supported yet, please add")
    end
  end
end
