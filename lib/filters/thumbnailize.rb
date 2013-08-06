class Thumbnailize < Nanoc::Filter
  identifier :thumbnailize
  type       :binary

  def run(filename, params={})
    system(
      'sips',
      '-Z',
      params[:width].to_s,
      '--out',
      output_filename,
      filename
    )
  end
end